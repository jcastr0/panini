import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Autocomplete de coleccionistas por username/display_name.
 * Devuelve {id, username, display_name, city} — máximo 8 resultados.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 1) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Buscar por username O display_name (case-insensitive)
  const escaped = q.replace(/[%_]/g, (m) => `\\${m}`);
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, city")
    .eq("is_public_profile", true)
    .neq("id", user.id)
    .or(`username.ilike.${escaped}%,display_name.ilike.%${escaped}%`)
    .order("username", { ascending: true })
    .limit(8);

  return NextResponse.json({ results: data ?? [] });
}
