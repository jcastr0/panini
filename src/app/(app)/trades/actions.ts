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

  const { data: trade } = await supabase
    .from("trades")
    .select("from_user, to_user, status")
    .eq("id", parsed.data.trade_id)
    .single();
  if (!trade) return { error: "Intercambio no encontrado" };

  const { trade_id, status } = parsed.data;
  // Reglas:
  // - cancelled: solo el que creó (from_user) y solo si pending
  // - accepted/rejected: solo el receptor (to_user) y solo si pending
  // - completed: cualquiera de los dos si está accepted
  if (status === "cancelled" && trade.from_user !== user.id)
    return { error: "Solo el creador puede cancelar" };
  if ((status === "accepted" || status === "rejected") && trade.to_user !== user.id)
    return { error: "Solo el receptor puede aceptar/rechazar" };
  if (status === "completed" && ![trade.from_user, trade.to_user].includes(user.id))
    return { error: "Solo participantes pueden completar" };

  const { error } = await supabase
    .from("trades")
    .update({ status })
    .eq("id", trade_id);
  if (error) return { error: error.message };

  revalidatePath("/trades");
  revalidatePath(`/trades/${trade_id}`);
  return { success: true };
}
