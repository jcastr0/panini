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
  100: "Legends · primera mitad",
  101: "Legends · segunda mitad",
};

export default async function LegendsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, ownedRows, collectorCard] = await Promise.all([
    getStickersBySection(album.id, "legends"),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id)
      .range(0, 9999),
    getCollectorCard(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  (ownedRows.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  return (
    <SpecialSectionPage
      sectionKey="legends"
      badge="Sección · Legends"
      letter={<span aria-hidden>⭐</span>}
      subtitle="27 cromos dorados de las leyendas del Mundial."
      accent={SPECIAL_SECTIONS.legends.accent}
      tint={SPECIAL_SECTIONS.legends.tint}
      stickers={stickers as SectionSticker[]}
      qtyMap={qtyMap}
      pageTitles={PAGE_TITLES}
      ownerProps={{
        username: collectorCard?.username ?? "",
        displayName: collectorCard?.display_name ?? null,
        collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
        avatarUrl: collectorCard?.avatar_url ?? null,
      }}
      prev={{ href: sectionHref("historia"), label: sectionLabel("historia") }}
      next={{ href: sectionHref("coca-cola"), label: sectionLabel("coca-cola") }}
    />
  );
}
