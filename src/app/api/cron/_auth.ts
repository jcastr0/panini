import { NextRequest } from "next/server";

/** Verifica que un endpoint de cron viene del pg_cron con el secret correcto. */
export function isCronAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("Authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice("Bearer ".length).trim();
  return token === secret;
}
