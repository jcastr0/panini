import { createClient } from "@/lib/supabase/server";
import { sectionKey } from "@/lib/album-config";

/**
 * Supabase tiene un cap server-side default de 1000 filas. El cap NO se
 * bypasa con .range(0, 9999) — el server limita a 1000 filas por response
 * regardless del Range header. Para listas que pasan de 1000 hay que
 * paginar con múltiples .range() calls.
 *
 * Esta función pagina automáticamente hasta agotar resultados. Devuelve
 * el array de todas las filas concatenadas.
 *
 *   await paginate(buildQuery: (from, to) => Promise<{ data, count? }>, pageSize = 1000)
 */
export async function paginate<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  // Bound el loop por seguridad — 50 páginas × 1000 = 50k filas máximo.
  for (let i = 0; i < 50; i++) {
    const { data } = await buildQuery(from, from + pageSize - 1);
    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < pageSize) break; // no hay más
    from += pageSize;
  }
  return all;
}

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

  // Total via head:true count — Supabase REST trunca .select() a 1000
  // filas por default. El álbum ya pasó de 1000 con las legends.
  const { count: totalCount } = await supabase
    .from("stickers")
    .select("*", { count: "exact", head: true })
    .eq("album_id", album.id);
  const total = totalCount ?? 0;

  // user_stickers necesita la quantity por fila (para duplicates).
  // Paginamos para bypassear el cap server-side de 1000 filas.
  const rows = await paginate<{ sticker_id: string; quantity: number }>(
    (from, to) =>
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", userId)
        .gt("quantity", 0)
        .range(from, to),
  );

  const owned = rows.length;
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

/** Cromos de un grupo, agrupados por equipo (orden de página/número).
 *  Incluye un JOIN inverso self-ref con el sticker legend que apunta
 *  a cada slot (si existe). El field `legend` queda como array vacío
 *  para slots sin legend linkeada (PostgREST devuelve arrays para
 *  embedded resources).
 */
export async function getStickersByGroup(albumId: string, groupCode: string) {
  const supabase = await createClient();
  const { data: stickers } = await supabase
    .from("stickers")
    .select(
      `id, code, number, name, team, group_code, type, page,
       legend:stickers (id, code)`,
    )
    .eq("album_id", albumId)
    .eq("group_code", groupCode.toUpperCase())
    .order("page", { ascending: true })
    .order("number", { ascending: true });
  return stickers ?? [];
}

/** Cromos de una sección especial (apertura/historia/legends/coca-cola) */
export async function getStickersBySection(
  albumId: string,
  sectionKey: "apertura" | "historia" | "legends" | "coca-cola",
) {
  const supabase = await createClient();
  type Filter = { pageGte: number; pageLt: number; type: "legend" | null };
  const filters: Record<typeof sectionKey, Filter> = {
    apertura:    { pageGte: 0,   pageLt: 100, type: null },
    historia:    { pageGte: 106, pageLt: 110, type: null },
    legends:     { pageGte: 100, pageLt: 102, type: "legend" },
    "coca-cola": { pageGte: 110, pageLt: 120, type: null },
  };
  const f = filters[sectionKey];
  let q = supabase
    .from("stickers")
    .select("id, code, number, name, team, group_code, type, page")
    .eq("album_id", albumId)
    .is("group_code", null)
    .gte("page", f.pageGte)
    .lt("page", f.pageLt);
  if (f.type) q = q.eq("type", f.type);
  const { data: stickers } = await q
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

  // Total via head:true count — evita el cap de 1000 filas del .select()
  const { count: totalCount } = await supabase
    .from("stickers")
    .select("*", { count: "exact", head: true })
    .eq("album_id", album.id);
  const total = totalCount ?? 0;

  // Intento 1: RPC con GROUP BY (1 round-trip). Si la función no existe aún
  // en la DB, caemos al método legacy de N COUNT paralelos.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ownedData, error: rpcError } = await (supabase as any).rpc(
    "get_owned_counts",
    { p_user_ids: userIds },
  );

  if (!rpcError && ownedData) {
    (ownedData as { user_id: string; owned_count: number }[]).forEach(
      ({ user_id, owned_count }) => {
        const owned = Number(owned_count);
        const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
        result.set(user_id, { owned, total, percent });
      },
    );
    // Asegura que todos los userIds tengan entrada (los que no tienen cromos no aparecen en GROUP BY)
    userIds.forEach((uid) => {
      if (!result.has(uid)) result.set(uid, { owned: 0, total, percent: 0 });
    });
    return result;
  }

  // Fallback legacy — N head:true counts en paralelo
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

/** Stats por sección del álbum.
 *  Pagina stickers y user_stickers para bypassear el cap server-side de
 *  1000 filas de Supabase. El álbum tiene 1021 stickers (994 + 27 legends)
 *  y un usuario completo posee >1000 rows en user_stickers — sin paginar,
 *  los tiles del /album mostrarían progreso incorrecto (ej. historia 0/0). */
export async function getAllSectionStats(userId: string, albumId: string) {
  const supabase = await createClient();
  const [stickers, owned] = await Promise.all([
    paginate<{ id: string; group_code: string | null; page: number | null; type: string }>(
      (from, to) =>
        supabase
          .from("stickers")
          .select("id, group_code, page, type")
          .eq("album_id", albumId)
          .range(from, to),
    ),
    paginate<{ sticker_id: string; quantity: number }>(
      (from, to) =>
        supabase
          .from("user_stickers")
          .select("sticker_id, quantity")
          .eq("user_id", userId)
          .gt("quantity", 0)
          .range(from, to),
    ),
  ]);

  const ownedSet = new Set(owned.map((r) => r.sticker_id));
  const stats = new Map<string, { total: number; owned: number }>();

  stickers.forEach((s) => {
    const key = sectionKey(s.group_code, s.page, s.type);
    if (key === "other") return;
    const entry = stats.get(key) ?? { total: 0, owned: 0 };
    entry.total += 1;
    if (ownedSet.has(s.id)) entry.owned += 1;
    stats.set(key, entry);
  });

  return stats;
}

/** Tipo de cada notification — con joins ad-hoc para duplicate_available. */
export type NotificationRow = {
  id: string;
  user_id: string;
  kind:
    | "trade_received"
    | "trade_accepted"
    | "trade_rejected"
    | "trade_completed"
    | "trade_superseded"
    | "trade_cancelled"
    | "duplicate_available";
  trade_id: string | null;
  from_user: string | null;
  sticker_id: string | null;
  read_at: string | null;
  created_at: string;
  // Campos enriquecidos
  from_username?: string | null;
  from_display_name?: string | null;
  sticker_code?: string | null;
  sticker_name?: string | null;
};

/** Cuenta de notificaciones sin leer. Una sola query con head:true. */
export async function getUnreadNotificationsCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

/** Últimas N notificaciones del usuario (leídas o no), con joins enriquecidos. */
export async function getRecentNotifications(
  userId: string,
  limit = 10,
): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select(
      `id, user_id, kind, trade_id, from_user, sticker_id, read_at, created_at,
       from_profile:profiles!notifications_from_user_fkey(username, display_name),
       sticker:stickers(code, name)`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  type RawRow = {
    id: string;
    user_id: string;
    kind: NotificationRow["kind"];
    trade_id: string | null;
    from_user: string | null;
    sticker_id: string | null;
    read_at: string | null;
    created_at: string;
    from_profile: { username: string | null; display_name: string | null } | null;
    sticker: { code: string | null; name: string | null } | null;
  };
  return ((data ?? []) as unknown as RawRow[]).map((n) => ({
    id: n.id,
    user_id: n.user_id,
    kind: n.kind,
    trade_id: n.trade_id,
    from_user: n.from_user,
    sticker_id: n.sticker_id,
    read_at: n.read_at,
    created_at: n.created_at,
    from_username: n.from_profile?.username ?? null,
    from_display_name: n.from_profile?.display_name ?? null,
    sticker_code: n.sticker?.code ?? null,
    sticker_name: n.sticker?.name ?? null,
  }));
}
