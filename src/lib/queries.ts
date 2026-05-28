import { createClient } from "@/lib/supabase/server";

export async function getActiveAlbum() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("*")
    .eq("is_active", true)
    .order("edition_year", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getUserStats(userId: string) {
  const supabase = await createClient();
  const album = await getActiveAlbum();
  if (!album) {
    return { total: 0, owned: 0, missing: 0, duplicates: 0, percent: 0 };
  }

  const { data: stickers } = await supabase
    .from("stickers")
    .select("id")
    .eq("album_id", album.id);
  const total = stickers?.length ?? 0;

  const { data: rows } = await supabase
    .from("user_stickers")
    .select("sticker_id, quantity")
    .eq("user_id", userId)
    .gt("quantity", 0);

  const owned = rows?.length ?? 0;
  const duplicates =
    rows?.reduce(
      (acc, r) => acc + Math.max(0, (r.quantity ?? 0) - 1),
      0,
    ) ?? 0;
  const missing = Math.max(0, total - owned);
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  return { total, owned, missing, duplicates, percent };
}

export async function getCollectorCard(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, collector_card_base64, collector_card_updated_at",
    )
    .eq("id", userId)
    .maybeSingle();
  return data;
}

/** Cromos de un grupo, agrupados por equipo (orden de página/número) */
export async function getStickersByGroup(albumId: string, groupCode: string) {
  const supabase = await createClient();
  const { data: stickers } = await supabase
    .from("stickers")
    .select("id, code, number, name, team, group_code, type, page")
    .eq("album_id", albumId)
    .eq("group_code", groupCode.toUpperCase())
    .order("page", { ascending: true })
    .order("number", { ascending: true });
  return stickers ?? [];
}

/** Cromos de una sección especial (apertura/historia/coca-cola) */
export async function getStickersBySection(
  albumId: string,
  sectionKey: "apertura" | "historia" | "coca-cola",
) {
  const supabase = await createClient();
  const ranges = {
    apertura: { gte: 0, lt: 100 },
    historia: { gte: 100, lt: 110 },
    "coca-cola": { gte: 110, lt: 120 },
  };
  const r = ranges[sectionKey];
  const { data: stickers } = await supabase
    .from("stickers")
    .select("id, code, number, name, team, group_code, type, page")
    .eq("album_id", albumId)
    .is("group_code", null)
    .gte("page", r.gte)
    .lt("page", r.lt)
    .order("page", { ascending: true })
    .order("number", { ascending: true });
  return stickers ?? [];
}

/**
 * Porcentaje de avance para varios usuarios a la vez.
 * Usa N HEAD requests con count:exact en paralelo (uno por amigo) —
 * cada uno solo devuelve el número, sin transferir filas. Evita la
 * truncación a 1000 filas que tiene la API REST de Supabase cuando
 * se usa .in() sobre user_stickers (que tendría 48 × ~500 = 24k filas).
 *
 * Devuelve Map<user_id, { owned, total, percent }>.
 */
export async function getProgressForUsers(userIds: string[]) {
  const result = new Map<
    string,
    { owned: number; total: number; percent: number }
  >();
  if (userIds.length === 0) return result;

  const supabase = await createClient();
  const album = await getActiveAlbum();
  if (!album) return result;

  const { data: stickers } = await supabase
    .from("stickers")
    .select("id")
    .eq("album_id", album.id);
  const total = stickers?.length ?? 0;

  // N consultas paralelas con head:true — Supabase responde solo el count,
  // sin payload. Mucho más rápido y robusto que .in() con range.
  const counts = await Promise.all(
    userIds.map(async (uid) => {
      const { count } = await supabase
        .from("user_stickers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .gt("quantity", 0);
      return [uid, count ?? 0] as const;
    }),
  );

  counts.forEach(([uid, owned]) => {
    const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
    result.set(uid, { owned, total, percent });
  });
  return result;
}

/**
 * Última fecha de actividad de un usuario: la última vez que tocó
 * (pegó/despegó) un cromo. Se basa en MAX(user_stickers.updated_at).
 * Devuelve null si nunca ha tocado el álbum.
 */
export async function getLastActivity(userId: string): Promise<Date | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_stickers")
    .select("updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.updated_at ? new Date(data.updated_at) : null;
}

/** Stats por sección del álbum (1 viaje a DB) */
export async function getAllSectionStats(userId: string, albumId: string) {
  const supabase = await createClient();
  const [{ data: stickers }, { data: owned }] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, group_code, page")
      .eq("album_id", albumId),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", userId)
      .gt("quantity", 0),
  ]);

  const ownedSet = new Set((owned ?? []).map((r) => r.sticker_id));
  const stats = new Map<string, { total: number; owned: number }>();

  (stickers ?? []).forEach((s) => {
    let key: string;
    if (s.group_code) {
      key = s.group_code.toUpperCase();
    } else {
      const p = s.page ?? 0;
      if (p < 100) key = "apertura";
      else if (p < 110) key = "historia";
      else if (p < 120) key = "coca-cola";
      else key = "other";
    }
    const entry = stats.get(key) ?? { total: 0, owned: 0 };
    entry.total += 1;
    if (ownedSet.has(s.id)) entry.owned += 1;
    stats.set(key, entry);
  });

  return stats;
}
