"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendEmailAsync } from "@/lib/email";
import { SITE_URL } from "@/lib/email/client";
import { TradeReceivedEmail } from "@/lib/email/templates/trade-received";
import { TradeAcceptedEmail } from "@/lib/email/templates/trade-accepted";
import { TradeRejectedEmail } from "@/lib/email/templates/trade-rejected";

async function getDisplayName(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", userId)
    .maybeSingle();
  return data?.display_name || (data?.username ? `@${data.username}` : "un coleccionista");
}

const tradeItemSchema = z.object({
  sticker_id: z.string().uuid(),
  direction: z.enum(["offer", "request"]),
  quantity: z.coerce.number().int().positive(),
});

const createTradeSchema = z.object({
  to_user: z.string().uuid(),
  message: z.string().max(500).optional().nullable(),
  items: z.array(tradeItemSchema).min(1, "Agrega al menos un cromo"),
});

function revalidateTrade(tradeId: string) {
  revalidatePath("/trades");
  revalidatePath(`/trades/${tradeId}`);
  revalidatePath("/", "layout"); // refresca badge del tab bar
}

export async function createTrade(input: z.infer<typeof createTradeSchema>) {
  const parsed = createTradeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { to_user, message, items } = parsed.data;
  if (!items.some((i) => i.direction === "offer")) {
    return { error: "Debes ofrecer al menos un cromo" };
  }
  if (!items.some((i) => i.direction === "request")) {
    return { error: "Debes pedir al menos un cromo" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: trade, error } = await supabase
    .from("trades")
    .insert({
      from_user: user.id,
      to_user,
      message: message ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !trade) return { error: error?.message ?? "No se pudo crear" };

  const itemsToInsert = items.map((i) => ({
    trade_id: trade.id,
    sticker_id: i.sticker_id,
    direction: i.direction,
    quantity: i.quantity,
  }));
  const { error: itemsError } = await supabase
    .from("trade_items")
    .insert(itemsToInsert);
  if (itemsError) {
    await supabase.from("trades").delete().eq("id", trade.id);
    return { error: itemsError.message };
  }

  // Email al receptor (no bloqueante, respeta pref email_trades)
  const proposerName = await getDisplayName(supabase, user.id);
  const recipientName = await getDisplayName(supabase, to_user);
  const offerCount = items.filter((i) => i.direction === "offer").length;
  const requestCount = items.filter((i) => i.direction === "request").length;
  sendEmailAsync({
    userId: to_user,
    prefKey: "trades",
    kind: "trade_received",
    subjectId: trade.id,
    subject: `${proposerName} te propuso un intercambio`,
    dedupeHours: 1 / 60, // ~1 min — anti race
    render: (unsubscribeUrl) =>
      TradeReceivedEmail({
        recipientName,
        proposerName,
        offerCount,
        requestCount,
        message: message ?? null,
        tradeUrl: `${SITE_URL}/trades/${trade.id}`,
        unsubscribeUrl,
      }),
  });

  revalidatePath("/trades");
  revalidatePath("/trades/new");
  revalidatePath("/", "layout");
  redirect(`/trades/${trade.id}`);
}

const updateStatusSchema = z.object({
  trade_id: z.string().uuid(),
  status: z.enum(["accepted", "rejected", "cancelled", "completed"]),
  auto_paste: z.boolean().optional(),
});

export async function updateTradeStatus(
  input: z.infer<typeof updateStatusSchema>,
) {
  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { trade_id, status } = parsed.data;

  // Para 'accepted' y 'completed' usamos RPCs que aplican lógica de negocio
  // (auto-rechazo de competidores; transferencia atómica de cantidades).
  if (status === "accepted") {
    const { error } = await supabase.rpc("accept_trade", { p_trade_id: trade_id });
    if (error) return { error: error.message };

    // Email al proposer informando que aceptaron
    const { data: tr } = await supabase
      .from("trades")
      .select("from_user, to_user")
      .eq("id", trade_id)
      .single();
    if (tr) {
      const recipientName = await getDisplayName(supabase, tr.from_user);
      const accepterName = await getDisplayName(supabase, tr.to_user);
      sendEmailAsync({
        userId: tr.from_user,
        prefKey: "trades",
        kind: "trade_accepted",
        subjectId: trade_id,
        subject: `${accepterName} aceptó tu intercambio`,
        dedupeHours: 1 / 60,
        render: (unsubscribeUrl) =>
          TradeAcceptedEmail({
            recipientName,
            accepterName,
            tradeUrl: `${SITE_URL}/trades/${trade_id}`,
            unsubscribeUrl,
          }),
      });
    }

    revalidateTrade(trade_id);
    return { success: true };
  }
  if (status === "completed") {
    const autoPaste = parsed.data.auto_paste ?? true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("complete_trade", {
      p_trade_id: trade_id,
      p_auto_paste: autoPaste,
    });
    if (error) return { error: error.message };
    revalidateTrade(trade_id);
    return { success: true };
  }

  // 'rejected' y 'cancelled': update directo con validación de permisos.
  const { data: trade } = await supabase
    .from("trades")
    .select("from_user, to_user, status")
    .eq("id", trade_id)
    .single();
  if (!trade) return { error: "Intercambio no encontrado" };

  if (status === "cancelled" && trade.from_user !== user.id)
    return { error: "Solo el creador puede cancelar" };
  if (status === "rejected" && trade.to_user !== user.id)
    return { error: "Solo el receptor puede rechazar" };

  // Notificar al otro participante
  const otherUser = trade.from_user === user.id ? trade.to_user : trade.from_user;
  const notifKind = status === "rejected" ? "trade_rejected" : "trade_cancelled";

  const { error } = await supabase
    .from("trades")
    .update({ status })
    .eq("id", trade_id);
  if (error) return { error: error.message };

  await supabase
    .from("notifications")
    .insert({ user_id: otherUser, kind: notifKind, trade_id });

  // Email solo si fue 'rejected' (cancelled no notifica al otro lado por email)
  if (status === "rejected") {
    const recipientName = await getDisplayName(supabase, otherUser);
    const rejecterName = await getDisplayName(supabase, user.id);
    sendEmailAsync({
      userId: otherUser,
      prefKey: "trades",
      kind: "trade_rejected",
      subjectId: trade_id,
      subject: `${rejecterName} rechazó tu intercambio`,
      dedupeHours: 1 / 60,
      render: (unsubscribeUrl) =>
        TradeRejectedEmail({
          recipientName,
          rejecterName,
          newMatchesUrl: `${SITE_URL}/trades/new`,
          unsubscribeUrl,
        }),
    });
  }

  revalidateTrade(trade_id);
  return { success: true };
}

export async function reconcileTrade(trade_id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("reconcile_trade", {
    p_trade_id: trade_id,
  });
  if (error) return { error: error.message };
  revalidateTrade(trade_id);
  return {
    success: true,
    adjusted: data?.adjusted ?? 0,
    removed: data?.removed ?? 0,
    autoCancelled: data?.auto_cancelled ?? false,
  };
}

export async function pasteTradeItem(trade_item_id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("paste_trade_item", {
    p_trade_item_id: trade_item_id,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function pasteRemainingTradeItems(trade_id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("paste_remaining_trade_items", {
    p_trade_id: trade_id,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true, pasted: (data as number) ?? 0 };
}
