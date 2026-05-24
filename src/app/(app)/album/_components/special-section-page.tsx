import { SectionFooterNav, SectionHero } from "./section-hero";
import { SpecialSection } from "./special-section";
import type { SectionSticker } from "./team-block";
import type { SpecialKey } from "@/lib/album-config";

export function SpecialSectionPage({
  sectionKey,
  badge,
  letter,
  subtitle,
  accent,
  tint,
  stickers,
  qtyMap,
  pageTitles,
  ownerProps,
  prev,
  next,
  extraSlot,
}: {
  sectionKey: SpecialKey;
  badge: string;
  letter: React.ReactNode;
  subtitle?: string;
  accent: string;
  tint: string;
  stickers: SectionSticker[];
  qtyMap: Map<string, number>;
  pageTitles: Record<number, string>;
  ownerProps: {
    username: string;
    displayName: string | null;
    collectorCardBase64: string | null;
    avatarUrl: string | null;
  };
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  extraSlot?: React.ReactNode;
}) {
  const byPage = new Map<number, SectionSticker[]>();
  stickers.forEach((s) => {
    const p = s.page ?? 0;
    if (!byPage.has(p)) byPage.set(p, []);
    byPage.get(p)!.push(s);
  });
  const pages = [...byPage.entries()].sort(([a], [b]) => a - b);
  const total = stickers.length;
  const owned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;

  return (
    <div
      className="space-y-10"
      style={
        {
          "--accent-section": accent,
          "--tint-section": tint,
        } as React.CSSProperties
      }
      data-section={sectionKey}
    >
      <SectionHero
        accent={accent}
        tint={tint}
        badge={badge}
        letter={letter}
        subtitle={subtitle}
        owned={owned}
        total={total}
        ownerProps={ownerProps}
      />

      {extraSlot}

      <SpecialSection
        pages={pages}
        qtyMap={qtyMap}
        pageTitles={pageTitles}
      />

      <SectionFooterNav prev={prev} next={next} />
    </div>
  );
}
