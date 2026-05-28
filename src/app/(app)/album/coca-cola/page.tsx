import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getStickersBySection,
  paginate,
} from "@/lib/queries";
import { sectionHref, sectionLabel, SPECIAL_SECTIONS } from "@/lib/album-config";
import { CocaColaIcon } from "@/components/icons/CocaColaIcon";
import { SpecialSectionPage } from "../_components/special-section-page";
import type { SectionSticker } from "../_components/team-block";

const PAGE_TITLES: Record<number, string> = {
  110: "Coca-Cola · Estrellas (1)",
  111: "Coca-Cola · Estrellas (2)",
};

export default async function CocaColaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, ownedRows, collectorCard] = await Promise.all([
    getStickersBySection(album.id, "coca-cola"),
    paginate<{ sticker_id: string; quantity: number }>((from, to) =>
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", user.id)
        .range(from, to),
    ).then((data) => ({ data })),
    getCollectorCard(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  (ownedRows.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  return (
    <SpecialSectionPage
      sectionKey="coca-cola"
      badge="Sección · Coca-Cola"
      letter={<CocaColaIcon className="h-14 sm:h-20 lg:h-24 w-auto max-w-[14rem] sm:max-w-[18rem]" />}
      subtitle="Cromos especiales del sponsor del torneo."
      accent={SPECIAL_SECTIONS["coca-cola"].accent}
      tint={SPECIAL_SECTIONS["coca-cola"].tint}
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
    />
  );
}
