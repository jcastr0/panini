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
  0: "Portada",
  1: "El Trofeo",
  2: "Identidad del torneo",
  3: "Balón y póster oficial",
};

export default async function AperturaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, ownedRows, collectorCard] = await Promise.all([
    getStickersBySection(album.id, "apertura"),
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

  const ownerProps = {
    username: collectorCard?.username ?? "",
    displayName: collectorCard?.display_name ?? null,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };

  return (
    <SpecialSectionPage
      sectionKey="apertura"
      badge="Sección · Apertura"
      letter={<span aria-hidden>🎉</span>}
      subtitle="Portada, trofeo, sedes y balón oficial."
      accent={SPECIAL_SECTIONS.apertura.accent}
      tint={SPECIAL_SECTIONS.apertura.tint}
      stickers={stickers as SectionSticker[]}
      qtyMap={qtyMap}
      pageTitles={PAGE_TITLES}
      ownerProps={ownerProps}
      next={{
        href: sectionHref("A"),
        label: sectionLabel("A"),
      }}
      extraSlot={
        collectorCard?.collector_card_base64 ? (
          <YourCardBanner base64={collectorCard.collector_card_base64} />
        ) : (
          <UploadCardPrompt />
        )
      }
    />
  );
}

function YourCardBanner({ base64 }: { base64: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
      <div className="w-24 sm:w-32 aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-border shadow-md shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${base64}`}
          alt="Tu lámina del coleccionista"
          className="size-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Tu lámina destacada
        </span>
        <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
          La portada es tuya
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Esta lámina aparece en cada sección del álbum y permite que quien lo
          vea sepa que es tuyo.
        </p>
      </div>
    </div>
  );
}

function UploadCardPrompt() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
      <div className="w-24 sm:w-28 aspect-[3/4] rounded-lg bg-muted grid place-items-center text-3xl shrink-0">
        🎴
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight">
          ¿Tienes tu lámina del coleccionista?
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Súbela en tu perfil. Aparece aquí en la portada y como tu firma en
          cada sección del álbum.
        </p>
        <a
          href="/profile"
          className="inline-flex items-center text-sm font-medium underline underline-offset-4"
        >
          Ir a mi perfil →
        </a>
      </div>
    </div>
  );
}
