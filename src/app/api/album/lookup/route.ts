import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildStickerUrl } from "@/lib/album-lookup";

/**
 * Búsqueda de cromos por código o nombre.
 * Devuelve hasta 12 matches con URL precalculada al cromo en el álbum.
 *
 * Estrategias en orden:
 *   1. Match EXACTO por code (case-insensitive) — si "mex10" matchea uno, va arriba
 *   2. Code que EMPIEZA con la query (ilike q%)
 *   3. Nombre/team que CONTIENE la query (ilike %q%)
 */
export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (raw.length < 1) return NextResponse.json({ results: [] });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Normalizar: el código suele venir en mayúsculas (MEX10), pero el usuario
  // puede teclear "mex10", "Mex 10", "mex-10". Quitamos espacios/guiones.
  const cleaned = raw.replace(/[\s-]/g, "");
  const codeQuery = cleaned.toUpperCase();
  const escaped = codeQuery.replace(/[%_]/g, (m) => `\\${m}`);
  const escNameLower = raw.toLowerCase().replace(/[%_]/g, (m) => `\\${m}`);

  const { data } = await supabase
    .from("stickers")
    .select("id, code, team, group_code, type, page, name")
    .or(
      `code.ilike.${escaped}%,name.ilike.%${escNameLower}%,team.ilike.%${escNameLower}%`,
    )
    .limit(20);

  const rows = (data ?? []) as Array<{
    id: string;
    code: string | null;
    team: string | null;
    group_code: string | null;
    type: string;
    page: number | null;
    name: string;
  }>;

  // Cantidad que tiene el usuario de cada sticker matched
  const stickerIds = rows.map((r) => r.id);
  const qtyMap = new Map<string, number>();
  if (stickerIds.length > 0) {
    const { data: us } = await supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id)
      .in("sticker_id", stickerIds);
    (us ?? []).forEach((r) => qtyMap.set(r.sticker_id, r.quantity ?? 0));
  }

  // Ranking: exacto > prefijo > contains
  const ranked = rows
    .map((r) => {
      const codeUp = (r.code ?? "").toUpperCase();
      let score = 0;
      if (codeUp === codeQuery) score = 100;
      else if (codeUp.startsWith(codeQuery)) score = 50;
      else if ((r.name ?? "").toLowerCase().includes(raw.toLowerCase())) score = 20;
      else if ((r.team ?? "").toLowerCase().includes(raw.toLowerCase())) score = 15;
      return { row: r, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const results = ranked.map(({ row }) => ({
    id: row.id,
    code: row.code ?? "",
    team: row.team,
    group_code: row.group_code,
    type: row.type,
    page: row.page,
    name: row.name,
    url: buildStickerUrl(row),
    qty: qtyMap.get(row.id) ?? 0,
  }));

  return NextResponse.json({ results });
}
