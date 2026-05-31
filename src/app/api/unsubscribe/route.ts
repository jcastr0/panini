import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken, PREF_COLUMN } from "@/lib/email/unsubscribe";

const PREF_LABEL: Record<string, string> = {
  trades: "Intercambios",
  matches: "Matches disponibles",
  digest: "Resumen semanal",
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const verified = token ? verifyUnsubscribeToken(token) : null;
  if (!verified) {
    return NextResponse.redirect(
      new URL("/unsubscribed?status=invalid", req.url),
    );
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const col = PREF_COLUMN[verified.prefKey];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await sb
    .from("profiles")
    .update({ [col]: false } as any)
    .eq("id", verified.userId);

  if (error) {
    console.error("[unsubscribe] update failed:", error.message);
    return NextResponse.redirect(
      new URL("/unsubscribed?status=error", req.url),
    );
  }

  return NextResponse.redirect(
    new URL(
      `/unsubscribed?pref=${verified.prefKey}&label=${encodeURIComponent(PREF_LABEL[verified.prefKey])}`,
      req.url,
    ),
  );
}

/**
 * Soporte para POST one-click (header List-Unsubscribe-Post=One-Click).
 * Gmail puede mandar POST sin parámetros adicionales — usa el mismo token de la URL.
 */
export async function POST(req: NextRequest) {
  return GET(req);
}
