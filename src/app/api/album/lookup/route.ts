import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildStickerUrl } from "@/lib/album-lookup";

/**
 * Búsqueda de cromos por código, nombre o equipo. Accent-insensitive
 * (buscar "iran" matchea "Irán", "mexico" matchea "México").
 *
 * Devuelve hasta 12 matches con URL precalculada al cromo en el álbum.
 *
 * Estrategias en orden:
 *   1. Match EXACTO por code (case-insensitive) — si "mex10" matchea uno, va arriba
 *   2. Code que EMPIEZA con la query
 *   3. Nombre/team que CONTIENE la query (sin acentos)
 */

// Strip diacritics: "Irán" → "iran", "México" → "mexico".
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

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

  const cleaned = raw.replace(/[\s-]/g, "");
  const codeQuery = cleaned.toUpperCase();
  const qFold = fold(raw);

  // Llamada a la RPC con unaccent — única forma de hacer accent-insensitive
  // en Postgres porque ilike es solo case-insensitive.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("search_stickers", { p_q: raw });

  const rows = (data ?? []) as Array<{
    id: string;
    code: string | null;
    team: string | null;
    group_code: string | null;
    type: string;
    page: number | null;
    number: number | null;
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

  // Ranking: exacto > prefijo > contains. También accent-insensitive en JS
  // para que el orden refleje la búsqueda del usuario.
  const ranked = rows
    .map((r) => {
      const codeUp = (r.code ?? "").toUpperCase();
      const nameFold = fold(r.name ?? "");
      const teamFold = fold(r.team ?? "");
      let score = 0;
      if (codeUp === codeQuery) score = 100;
      else if (codeUp.startsWith(codeQuery)) score = 50;
      else if (nameFold.includes(qFold)) score = 20;
      else if (teamFold.includes(qFold)) score = 15;
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
