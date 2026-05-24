"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Usuario debe tener al menos 3 caracteres")
    .max(32)
    .regex(/^[a-z0-9_]+$/i, "Solo letras, números y guion bajo")
    .transform((s) => s.toLowerCase()),
  display_name: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  is_public_profile: z.boolean().default(true),
});

export type UpdateProfileState = { error?: string; success?: boolean };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = profileSchema.safeParse({
    username: formData.get("username"),
    display_name: formData.get("display_name") || null,
    city: formData.get("city") || null,
    country: formData.get("country") || null,
    is_public_profile: formData.get("is_public_profile") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data });
  if (error) {
    if (error.code === "23505") {
      return { error: "Ese usuario ya está en uso" };
    }
    return { error: error.message };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: true };
}
