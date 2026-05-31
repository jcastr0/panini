"use server";

import { createClient } from "@/lib/supabase/server";
import { PREF_COLUMN, type PrefKey } from "@/lib/email/unsubscribe";

/**
 * Volver a activar una preferencia desde la página /unsubscribed.
 * Requiere usuario autenticado (no se acepta resubscribe sin login para
 * evitar ataques de re-suscripción masiva).
 */
export async function resubscribeAction(formData: FormData) {
  const pref = formData.get("pref");
  if (typeof pref !== "string" || !(pref in PREF_COLUMN)) {
    return { error: "Preferencia inválida" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Inicia sesión para reactivar esta notificación" };
  }
  const col = PREF_COLUMN[pref as PrefKey];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase
    .from("profiles")
    .update({ [col]: true } as any)
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { ok: true };
}
