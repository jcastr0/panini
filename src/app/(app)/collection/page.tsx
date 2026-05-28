import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getUserStats,
} from "@/lib/queries";
import { Progress } from "@/components/ui/progress";
import { AlbumOwnerTag } from "../album/_components/album-owner-tag";
import {
  CollectionTabs,
  type CollectionSticker,
} from "./_components/collection-tabs";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickersResult, ownedResult, stats, collectorCard] = await Promise.all(
    [
      supabase
        .from("stickers")
        .select("id, code, number, name, team, group_code, type, page")
        .eq("album_id", album.id)
        .order("page", { ascending: true })
        .order("number", { ascending: true })
        .range(0, 9999),
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", user.id)
        .range(0, 9999),
      getUserStats(user.id),
      getCollectorCard(user.id),
    ],
  );

  const qtyMap = new Map<string, number>();
  (ownedResult.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  const stickers: CollectionSticker[] = (stickersResult.data ?? []).map((s) => ({
    ...s,
    qty: qtyMap.get(s.id) ?? 0,
  }));

  const ownerProps = {
    username: collectorCard?.username ?? "",
    displayName: collectorCard?.display_name ?? null,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <AlbumOwnerTag {...ownerProps} size="sm" />
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <span className="eyebrow">Tu álbum</span>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Mi colección
            </h1>
          </div>
          <span className="font-mono tabular text-sm text-muted-foreground">
            {stats.owned}/{stats.total} cromos
          </span>
        </div>
      </header>

      <div className="grid sm:grid-cols-4 gap-3">
        <BigStat label="Avance" value={`${stats.percent}%`} accent="pitch">
          <Progress value={stats.percent} className="mt-3" />
        </BigStat>
        <BigStat label="🟢 Tienes" value={stats.owned} />
        <BigStat label="🔴 Faltan" value={stats.missing} accent="red" />
        <BigStat label="🟡 Repetidos" value={stats.duplicates} accent="gold" />
      </div>

      <CollectionTabs
        stickers={stickers}
        ownedCount={stats.owned}
        duplicatesCount={stats.duplicates}
        missingCount={stats.missing}
      />
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value: string | number;
  accent?: "pitch" | "red" | "gold";
  children?: React.ReactNode;
}) {
  const color =
    accent === "pitch"
      ? "text-[var(--panini-blue)]"
      : accent === "red"
        ? "text-[var(--panini-red)]"
        : accent === "gold"
          ? "text-[var(--gold)]"
          : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="eyebrow mb-2">{label}</div>
      <div className={`font-display text-4xl font-bold tabular ${color}`}>
        {value}
      </div>
      {children}
    </div>
  );
}
