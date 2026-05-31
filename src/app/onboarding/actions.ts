"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEPARTMENT_NAMES } from "@/lib/colombia";

export async function saveLocationAction(input: {
  country: string;
  department: string | null;
  city: string;
}) {
  const country = input.country.trim();
  const department = input.department?.trim() || null;
  const city = input.city.trim();

  if (!country) return { error: "El país es obligatorio" };
  if (!city) return { error: "La ciudad es obligatoria" };
  if (country === "Colombia") {
    if (!department) return { error: "El departamento es obligatorio" };
    if (!DEPARTMENT_NAMES.includes(department)) {
      return { error: "Departamento inválido" };
    }
  }
  if (country.length > 50 || city.length > 50) {
    return { error: "Texto demasiado largo" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from("profiles")
    .update({ country, department, city } as any)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
