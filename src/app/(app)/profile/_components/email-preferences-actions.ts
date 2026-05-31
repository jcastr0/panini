"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PREF_COLUMN, type PrefKey } from "@/lib/email/unsubscribe";

export async function updateEmailPreference({
  prefKey,
  enabled,
}: {
  prefKey: PrefKey;
  enabled: boolean;
}) {
  if (!(prefKey in PREF_COLUMN)) return { error: "Preferencia inválida" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  const col = PREF_COLUMN[prefKey];
  // Cast hasta regenerar types: la migración 0033 agregó email_* boolean cols
  const { error } = await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ [col]: enabled } as any)
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { ok: true };
}
