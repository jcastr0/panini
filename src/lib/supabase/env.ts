/**
 * Resolver de variables Supabase a runtime.
 * La integración Vercel↔Supabase las inyecta con nombres muy variados.
 * Esta función intenta cada nombre conocido hasta encontrar uno con valor.
 *
 * IMPORTANTE para el browser: solo NEXT_PUBLIC_* se inlinea al bundle del
 * cliente. Las otras variantes (PANINIJD_*) solo existen en server/edge.
 */

const PUBLIC_URL_NAMES = [
  // El cliente solo verá las NEXT_PUBLIC_ inlineadas; las server-only
  // intentan resolver en Edge/Node a runtime.
  "NEXT_PUBLIC_SUPABASE_URL",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_URL",
  "PANINIJD_PUBLIC_SUPABASE_URL",
  "PANINIJD_SUPABASE_URL",
] as const;

const PUBLIC_KEY_NAMES = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_ANON_KEY",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_PUBLIC_SUPABASE_ANON_KEY",
  "PANINIJD_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_SUPABASE_ANON_KEY",
  "PANINIJD_SUPABASE_PUBLISHABLE_KEY",
] as const;

function firstNonEmpty(names: readonly string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.length > 0) return v;
  }
  return "";
}

export function supabaseUrl(): string {
  return firstNonEmpty(PUBLIC_URL_NAMES);
}

export function supabaseAnonKey(): string {
  return firstNonEmpty(PUBLIC_KEY_NAMES);
}
