"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setStickerQuantity(stickerId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 999) {
    return { error: "Cantidad inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Cantidad PREVIA (para detectar si esto es un "pegar" — pasar de 0 a >=1)
  const { data: previous } = await supabase
    .from("user_stickers")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("sticker_id", stickerId)
    .maybeSingle();
  const previousQty = previous?.quantity ?? 0;

  if (quantity === 0) {
    const { error } = await supabase
      .from("user_stickers")
      .delete()
      .eq("user_id", user.id)
      .eq("sticker_id", stickerId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("user_stickers").upsert({
      user_id: user.id,
      sticker_id: stickerId,
      quantity,
    });
    if (error) return { error: error.message };
  }

  // Si el user "pegó" el cromo (subió quantity y antes era 0), cerramos
  // cualquier trade_item pendiente del mismo sticker donde el user es el
  // receptor. Evita que el banner "Cromos por pegar" siga mostrando algo
  // que el user ya pegó manualmente, y evita el doble-conteo al hacer
  // click en "Pegar este" del banner después.
  if (previousQty === 0 && quantity >= 1) {
    // Buscar trade_items pendientes (status completed, pasted_at NULL,
    // user es receptor según direction)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pending } = await (supabase as any)
      .from("trade_items")
      .select("id, direction, trade_id, trades!inner(status, from_user, to_user)")
      .eq("sticker_id", stickerId)
      .is("pasted_at", null)
      .eq("trades.status", "completed");

    const idsToClose: string[] = [];
    for (const it of (pending ?? []) as Array<{
      id: string;
      direction: "offer" | "request";
      trades: { from_user: string; to_user: string };
    }>) {
      const receiver =
        it.direction === "offer" ? it.trades.to_user : it.trades.from_user;
      if (receiver === user.id) idsToClose.push(it.id);
    }

    if (idsToClose.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("trade_items")
        .update({ pasted_at: new Date().toISOString() })
        .in("id", idsToClose);
    }
  }

  revalidatePath("/album", "layout");
  revalidatePath("/collection");
  revalidatePath("/dashboard");
  revalidatePath("/trades", "layout");
  return { success: true };
}

/**
 * Set or clear the user's display variant for a slot in a team page.
 *
 * The slot is the NORMAL player sticker (e.g., ARG17). When variant='legend',
 * the team-view will render the legend's image/code/qty in place of the
 * normal — i.e., the user "pegó" the legend over the slot.
 *
 *   variant=null    → clear preference (defaults to normal)
 *   variant='normal' → explicit normal (same effect as null but persisted)
 *   variant='legend' → render the linked legend in this slot
 *
 * Validation:
 *   - slotStickerId must exist and NOT be type='legend'
 *   - If variant='legend': the slot must have a linked legend AND user must
 *     own ≥1 of that legend
 *
 * Mutation:
 *   - UPSERT user_stickers preserving quantity (never overwrite to 0)
 *   - If the user has no row for this slot, INSERT with quantity=0 +
 *     display_variant. Coherent with the album metaphor: "legend pegada
 *     sobre un slot vacío".
 */
export async function setDisplayVariant(
  slotStickerId: string,
  variant: "normal" | "legend" | null,
) {
  if (variant !== null && variant !== "normal" && variant !== "legend") {
    return { error: "Variante inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // 1) Slot exists and is not itself a legend
  const { data: slot } = await supabase
    .from("stickers")
    .select("id, type")
    .eq("id", slotStickerId)
    .maybeSingle();
  if (!slot) return { error: "Slot no existe" };
  if (slot.type === "legend") {
    return { error: "El slot no puede ser una legend" };
  }

  // 2) If setting 'legend': legend exists AND user owns it
  if (variant === "legend") {
    const { data: legend } = await supabase
      .from("stickers")
      .select("id")
      .eq("linked_sticker_id", slotStickerId)
      .eq("type", "legend")
      .maybeSingle();
    if (!legend) return { error: "Este slot no tiene legend asociada" };

    const { data: owned } = await supabase
      .from("user_stickers")
      .select("quantity")
      .eq("user_id", user.id)
      .eq("sticker_id", legend.id)
      .maybeSingle();
    if (!owned || (owned.quantity ?? 0) < 1) {
      return { error: "No posees esta legend" };
    }
  }

  // 3) UPSERT preserving quantity
  const { data: existing } = await supabase
    .from("user_stickers")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("sticker_id", slotStickerId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("user_stickers")
      .update({ display_variant: variant })
      .eq("user_id", user.id)
      .eq("sticker_id", slotStickerId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("user_stickers")
      .insert({
        user_id: user.id,
        sticker_id: slotStickerId,
        quantity: 0,
        display_variant: variant,
      });
    if (error) return { error: error.message };
  }

  revalidatePath("/album", "layout");
  return { success: true };
}
