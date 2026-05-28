import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum, getStickersBySection, paginate } from "@/lib/queries";
import { SPECIAL_SECTIONS, type SpecialKey } from "@/lib/album-config";
import { Fwc2026Icon } from "@/components/icons/Fwc2026Icon";
import { Fwc2026EmblemIcon } from "@/components/icons/Fwc2026EmblemIcon";
import { CocaColaIcon } from "@/components/icons/CocaColaIcon";
import { SpecialSection } from "@/app/(app)/album/_components/special-section";
import type { SectionSticker } from "@/app/(app)/album/_components/team-block";

const SECTION_ICONS: Record<SpecialKey, React.ReactNode> = {
  apertura:    <Fwc2026Icon className="h-[clamp(3.5rem,12vw,7rem)] w-auto" />,
  historia:    <Fwc2026EmblemIcon className="h-[clamp(3.5rem,12vw,7rem)] w-auto" />,
  legends: (
    <span className="inline-flex flex-col items-start gap-1.5">
      <Fwc2026EmblemIcon className="h-[clamp(2.5rem,9vw,5.5rem)] w-auto" />
      <span
        className="font-display font-black tracking-[0.28em] uppercase leading-none"
        style={{ fontSize: "clamp(0.7rem, 2.2vw, 1.2rem)" }}
      >
        Legends
      </span>
    </span>
  ),
  "coca-cola": <CocaColaIcon className="h-[clamp(2rem,6vw,3.5rem)] w-auto max-w-[clamp(8rem,28vw,14rem)]" />,
};

const VALID_SECTIONS = new Set<SpecialKey>([
  "apertura",
  "historia",
  "legends",
  "coca-cola",
]);

const PAGE_TITLES: Record<SpecialKey, Record<number, string>> = {
  apertura: {
    0: "Portada",
    1: "El Trofeo",
    2: "Identidad del torneo",
    3: "Balón y póster oficial",
  },
  historia: {
    106: "Campeones 1934-1962",
    107: "Campeones 1962-1974",
    108: "Campeones 1986-1994",
    109: "Campeones 2002-2022",
  },
  legends: {
    100: "Legends · primera mitad",
    101: "Legends · segunda mitad",
  },
  "coca-cola": {
    110: "Coca-Cola · primera mitad",
    111: "Coca-Cola · segunda mitad",
  },
};

export default async function PublicSpecialSectionPage({
  params,
}: {
  params: Promise<{ username: string; section: string }>;
}) {
  const { username, section: sectionRaw } = await params;
  const section = sectionRaw as SpecialKey;
  if (!VALID_SECTIONS.has(section)) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, is_public_profile")
    .eq("username", username)
    .maybeSingle();
  if (!profile || !profile.is_public_profile) notFound();

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, { data: ownedRows }] = await Promise.all([
    getStickersBySection(album.id, section),
    paginate<{ sticker_id: string; quantity: number }>((from, to) =>
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", profile.id)
        .range(from, to),
    ).then((data) => ({ data })),
  ]);

  const qtyMap = new Map<string, number>();
  (ownedRows ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  const special = SPECIAL_SECTIONS[section];
  const total = stickers.length;
  const owned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  // Agrupar por página
  const byPage = new Map<number, SectionSticker[]>();
  stickers.forEach((s) => {
    const p = s.page ?? 0;
    if (!byPage.has(p)) byPage.set(p, []);
    byPage.get(p)!.push(s as SectionSticker);
  });
  const pages = [...byPage.entries()].sort(([a], [b]) => a - b) as Array<
    [number, SectionSticker[]]
  >;
  const pageTitles = PAGE_TITLES[section];

  const ownerDisplay = profile.display_name ?? `@${profile.username}`;

  return (
    <div className="space-y-8">
      <section
        className="-mx-6 px-6 py-8 sm:py-10 rounded-b-3xl border-b"
        style={{ backgroundColor: special.tint }}
      >
        <div className="max-w-6xl mx-auto space-y-5">
          <Link
            href={`/u/${username}`}
            className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 text-sm font-medium hover:bg-card transition-colors"
          >
            <ArrowLeft className="size-4" /> Perfil de {ownerDisplay}
          </Link>

          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Álbum de @{profile.username}
            </span>
            <div
              className="font-display font-bold leading-none tracking-tighter"
              style={{
                color: special.accent,
                fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
              }}
            >
              {SECTION_ICONS[section as SpecialKey]}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="font-display text-2xl sm:text-3xl font-bold tabular"
              style={{ color: special.accent }}
            >
              {percent}%
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-background/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: special.accent,
                }}
              />
            </div>
            <span className="font-mono tabular text-sm text-muted-foreground">
              {owned}/{total}
            </span>
          </div>
        </div>
      </section>

      <div
        style={
          {
            "--accent-section": special.accent,
            "--tint-section": special.tint,
          } as React.CSSProperties
        }
      >
        <SpecialSection
          pages={pages}
          qtyMap={qtyMap}
          pageTitles={pageTitles}
          sectionKey={section}
          readOnly
        />
      </div>

      <p className="text-xs text-muted-foreground italic text-center">
        Vista de solo lectura · este es el álbum de @{profile.username}.
      </p>
    </div>
  );
}
