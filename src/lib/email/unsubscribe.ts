import { createHmac, timingSafeEqual } from "crypto";
import { SITE_URL } from "./client";

export type PrefKey = "trades" | "matches" | "digest";

export const PREF_COLUMN: Record<PrefKey, "email_trades" | "email_matches" | "email_digest"> = {
  trades: "email_trades",
  matches: "email_matches",
  digest: "email_digest",
};

const EXPIRY_DAYS = 90;

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64url");
}

function getSecret(): string {
  const s = process.env.EMAIL_SIGNING_SECRET;
  if (!s || s.length < 32) {
    throw new Error("EMAIL_SIGNING_SECRET no configurada (>=32 chars)");
  }
  return s;
}

/** Genera token firmado con HMAC-SHA256 que codifica (userId, prefKey, expiry). */
export function signUnsubscribeToken(userId: string, prefKey: PrefKey): string {
  const exp = Math.floor(Date.now() / 1000) + EXPIRY_DAYS * 86400;
  const payload = JSON.stringify({ u: userId, p: prefKey, e: exp });
  const payloadB64 = b64urlEncode(Buffer.from(payload));
  const hmac = createHmac("sha256", getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${b64urlEncode(hmac)}`;
}

/** Verifica token y devuelve { userId, prefKey } o null si inválido/expirado. */
export function verifyUnsubscribeToken(
  token: string,
): { userId: string; prefKey: PrefKey } | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, hmacB64] = parts;

  // Verificar firma
  const expected = createHmac("sha256", getSecret()).update(payloadB64).digest();
  let received: Buffer;
  try {
    received = Buffer.from(hmacB64, "base64url");
  } catch {
    return null;
  }
  if (received.length !== expected.length) return null;
  if (!timingSafeEqual(expected, received)) return null;

  // Parsear payload
  let payload: { u?: unknown; p?: unknown; e?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch {
    return null;
  }

  if (typeof payload.u !== "string") return null;
  if (typeof payload.p !== "string" || !(payload.p in PREF_COLUMN)) return null;
  if (typeof payload.e !== "number") return null;
  if (payload.e < Math.floor(Date.now() / 1000)) return null;

  return { userId: payload.u, prefKey: payload.p as PrefKey };
}

export function buildUnsubscribeUrl(userId: string, prefKey: PrefKey): string {
  const token = signUnsubscribeToken(userId, prefKey);
  return `${SITE_URL}/api/unsubscribe?token=${token}`;
}
