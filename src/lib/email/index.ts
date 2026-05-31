import * as React from "react";
import { render } from "@react-email/render";
import { createClient } from "@supabase/supabase-js";
import { EMAIL_FROM, getResend } from "./client";
import { shouldSkipDuplicate, logEmailSent } from "./dedupe";
import {
  buildUnsubscribeUrl,
  PREF_COLUMN,
  type PrefKey,
} from "./unsubscribe";

export type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; reason: "pref-off" | "duplicate" | "no-recipient" | "error"; error?: string };

type SendEmailArgs = {
  userId: string;
  prefKey: PrefKey;
  kind: string;
  subjectId: string | null;
  /** Función que recibe la unsubscribeUrl y devuelve el componente React Email a renderizar. */
  render: (unsubscribeUrl: string) => React.ReactElement;
  subject: string;
  dedupeHours: number;
};

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Envío de email que respeta preferencias, dedupe y agrega unsubscribe.
 * No bloqueante para el flujo de UI: si Resend falla, retorna error sin throw.
 */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const sb = adminClient();

  // 1. Resolver email + verificar pref ON
  const col = PREF_COLUMN[args.prefKey];
  const { data: userRow } = await sb.auth.admin.getUserById(args.userId);
  const email = userRow.user?.email;
  if (!email) return { sent: false, reason: "no-recipient" };

  const { data: profile } = await sb
    .from("profiles")
    .select(col)
    .eq("id", args.userId)
    .maybeSingle<Record<string, boolean | null>>();
  const enabled = profile?.[col];
  if (enabled === false) {
    return { sent: false, reason: "pref-off" };
  }

  // 2. Dedupe
  if (await shouldSkipDuplicate(args.userId, args.kind, args.subjectId, args.dedupeHours)) {
    return { sent: false, reason: "duplicate" };
  }

  // 3. Render + envío
  try {
    const unsubscribeUrl = buildUnsubscribeUrl(args.userId, args.prefKey);
    const html = await render(args.render(unsubscribeUrl));

    const result = await getResend().emails.send({
      from: EMAIL_FROM,
      to: [email],
      subject: args.subject,
      html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.error || !result.data?.id) {
      return { sent: false, reason: "error", error: result.error?.message ?? "no-id" };
    }

    await logEmailSent({
      userId: args.userId,
      kind: args.kind,
      subjectId: args.subjectId,
      resendId: result.data.id,
    });

    return { sent: true, id: result.data.id };
  } catch (e) {
    return {
      sent: false,
      reason: "error",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Wrapper que envía sin bloquear (fire and forget). Solo loggea errores. */
export function sendEmailAsync(args: SendEmailArgs): void {
  sendEmail(args).then((r) => {
    if (!r.sent && r.reason === "error") {
      console.error("[email]", args.kind, "→", r.error);
    } else if (!r.sent) {
      console.log("[email]", args.kind, "skipped:", r.reason);
    } else {
      console.log("[email]", args.kind, "sent:", r.id);
    }
  });
}
