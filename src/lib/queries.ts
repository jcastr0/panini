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
