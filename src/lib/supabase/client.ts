import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  // En el bundle del browser, solo las NEXT_PUBLIC_ inlineadas resolverán.
  // Si esto falla, hay que configurar NEXT_PUBLIC_SUPABASE_URL y
  // NEXT_PUBLIC_SUPABASE_ANON_KEY directamente en Vercel.
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  return createBrowserClient<Database>(url, key);
}
