import { Resend } from "resend";

let cached: Resend | null = null;

/** Lazy singleton — no inicializa Resend en build time si RESEND_API_KEY no está. */
export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurada");
  cached = new Resend(key);
  return cached;
}

export const EMAIL_FROM = "Panini·JD <noreply@paninijd.lat>";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.paninijd.lat";
