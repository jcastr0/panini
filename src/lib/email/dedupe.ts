import { createClient } from "@supabase/supabase-js";

/** Cliente admin (service role) — no expone RLS, solo para uso server-side. */
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** ¿Ya se envió este email recientemente? Para evitar duplicados de race conditions. */
export async function shouldSkipDuplicate(
  userId: string,
  kind: string,
  subjectId: string | null,
  withinHours: number,
): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 3600 * 1000).toISOString();
  const sb = adminClient();
  let q = sb
    .from("email_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("sent_at", since);
  q = subjectId ? q.eq("subject_id", subjectId) : q.is("subject_id", null);
  const { count } = await q;
  return (count ?? 0) > 0;
}

/** Registra el email enviado para futuras verificaciones de dedupe. */
export async function logEmailSent({
  userId,
  kind,
  subjectId,
  resendId,
}: {
  userId: string;
  kind: string;
  subjectId: string | null;
  resendId: string | null;
}) {
  const sb = adminClient();
  await sb.from("email_log").insert({
    user_id: userId,
    kind,
    subject_id: subjectId,
    resend_id: resendId,
  });
}
