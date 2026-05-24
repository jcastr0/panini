"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

  revalidatePath("/trades");
  revalidatePath("/trades/new");
  revalidatePath("/", "layout");
  redirect(`/trades/${trade.id}`);
}

const updateStatusSchema = z.object({
  trade_id: z.string().uuid(),
  status: z.enum(["accepted", "rejected", "cancelled", "completed"]),
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
    revalidateTrade(trade_id);
    return { success: true };
  }
  if (status === "completed") {
    const { error } = await supabase.rpc("complete_trade", { p_trade_id: trade_id });
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

  revalidateTrade(trade_id);
  return { success: true };
}
