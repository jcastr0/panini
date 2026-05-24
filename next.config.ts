import type { NextConfig } from "next";

// La integración Vercel↔Supabase inyecta las vars con prefijo PANINIJD_*.
// En proyectos Vercel también aparecen con DOBLE prefijo (PANINIJD_PANIJD_*),
// que es como Vercel expone las variables públicas de la integración.
// Supabase además introdujo nombres nuevos (PUBLISHABLE_KEY / SECRET_KEY) que
// reemplazan los legacy ANON_KEY / SERVICE_ROLE_KEY (formato JWT).
// Aquí aliaseamos todas las variantes posibles en build time.
const pick = (...names: string[]): string => {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return "";
};

const SUPABASE_URL = pick(
  "NEXT_PUBLIC_SUPABASE_URL",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_URL",
  "PANINIJD_PUBLIC_SUPABASE_URL",
  "PANINIJD_SUPABASE_URL",
);

// Cliente (público). Tanto el anon JWT legacy como la nueva publishable key.
const SUPABASE_ANON_KEY = pick(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_ANON_KEY",
  "PANINIJD_PANIJD_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_PUBLIC_SUPABASE_ANON_KEY",
  "PANINIJD_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "PANINIJD_SUPABASE_ANON_KEY",
  "PANINIJD_SUPABASE_PUBLISHABLE_KEY",
);

// Server-only. Tanto el service_role JWT legacy como la nueva secret key.
const SUPABASE_SERVICE_ROLE = pick(
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "PANINIJD_SUPABASE_SERVICE_ROLE_KEY",
  "PANINIJD_SUPABASE_SECRET_KEY",
);

const nextConfig: NextConfig = {
  // Sharp es código nativo: debe quedar como dependencia externa del bundle del server.
  serverExternalPackages: ["sharp"],
  // ESLint flat-config en Next 15 todavía es flaky; lo corremos aparte cuando haga falta.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // `env` se inyecta como `process.env.X` en cliente y server en tiempo de build.
  // Solo las que empiezan con NEXT_PUBLIC_ se exponen al browser; el resto solo server.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE,
  },
};

export default nextConfig;
