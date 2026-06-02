"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DEPARTMENT_NAMES } from "@/lib/colombia";

const profileSchema = z
  .object({
    username: z
      .string()
      .min(3, "Usuario debe tener al menos 3 caracteres")
      .max(32)
      .regex(/^[a-z0-9_]+$/i, "Solo letras, números y guion bajo")
      .transform((s) => s.toLowerCase()),
    display_name: z.string().max(80).optional().nullable(),
    city: z.string().max(80).optional().nullable(),
    department: z.string().max(80).optional().nullable(),
    country: z.string().max(80).optional().nullable(),
    phone: z
      .string()
      .max(30)
      .optional()
      .nullable()
      .transform((v) => {
        if (!v) return null;
        const digits = v.replace(/\D/g, "");
        return digits.length === 0 ? null : digits;
      })
      .refine(
        (v) => v === null || (v.length >= 8 && v.length <= 15),
        "Teléfono inválido (8 a 15 dígitos)",
      ),
    is_public_profile: z.boolean().default(true),
  })
  .refine(
    (d) => !!d.country && d.country.trim() !== "",
    { message: "El país es obligatorio", path: ["country"] },
  )
  .refine(
    (d) => !!d.city && d.city.trim() !== "",
    { message: "La ciudad es obligatoria", path: ["city"] },
  )
  .refine(
    (d) =>
      d.country !== "Colombia" ||
      (!!d.department && DEPARTMENT_NAMES.includes(d.department)),
    { message: "El departamento es obligatorio", path: ["department"] },
  );

export type UpdateProfileState = { error?: string; success?: boolean };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const parsed = profileSchema.safeParse({
    username: formData.get("username"),
    display_name: formData.get("display_name") || null,
    city: formData.get("city") || null,
    department: formData.get("department") || null,
    country: formData.get("country") || null,
    phone: formData.get("phone") || null,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data } as any);
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
