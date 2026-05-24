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

  revalidatePath("/album");
  revalidatePath("/collection");
  revalidatePath("/dashboard");
  return { success: true };
}
