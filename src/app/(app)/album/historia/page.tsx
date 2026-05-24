import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getStickersBySection,
} from "@/lib/queries";
import { sectionHref, sectionLabel, SPECIAL_SECTIONS } from "@/lib/album-config";
import { SpecialSectionPage } from "../_components/special-section-page";
import type { SectionSticker } from "../_components/team-block";

const PAGE_TITLES: Record<number, string> = {
  106: "Campeones · 1934-1950",
  107: "Campeones · 1954-1974",
  108: "Campeones · 1986-2002",
  109: "Campeones · 2006-2022",
};

export default async function HistoriaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, ownedRows, collectorCard] = await Promise.all([
    getStickersBySection(album.id, "historia"),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id),
    getCollectorCard(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  (ownedRows.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  return (
    <SpecialSectionPage
      sectionKey="historia"
      badge="Sección · Historia"
      title={<span>Los campeones</span>}
      subtitle="Once cromos foil con los campeones del mundo desde 1934."
      accent={SPECIAL_SECTIONS.historia.accent}
      tint={SPECIAL_SECTIONS.historia.tint}
      stickers={stickers as SectionSticker[]}
      qtyMap={qtyMap}
      pageTitles={PAGE_TITLES}
      ownerProps={{
        username: collectorCard?.username ?? "",
        displayName: collectorCard?.display_name ?? null,
        collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
        avatarUrl: collectorCard?.avatar_url ?? null,
      }}
      prev={{ href: sectionHref("L"), label: sectionLabel("L") }}
      next={{ href: sectionHref("coca-cola"), label: sectionLabel("coca-cola") }}
    />
  );
}
