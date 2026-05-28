import Link from "next/link";
import { Check } from "lucide-react";
import { Fwc2026Icon } from "@/components/icons/Fwc2026Icon";
import { Fwc2026EmblemIcon } from "@/components/icons/Fwc2026EmblemIcon";
import { CocaColaIcon } from "@/components/icons/CocaColaIcon";
import {
  GROUP_TEAMS,
  SPECIAL_SECTIONS,
  sectionHref,
  sectionLabel,
  sectionPalette,
  type GroupCode,
  type SpecialKey,
} from "@/lib/album-config";

const SPECIAL_ICONS: Record<SpecialKey, React.ReactNode> = {
  /* portrait 412×636 → subimos la h para que se vea más grande en el tile */
  apertura:    <Fwc2026Icon className="h-24 w-auto" />,
  /* cuadrado 1320×1320 */
  historia:    <Fwc2026EmblemIcon className="size-20" />,
  legends: (
    <span className="flex flex-col items-center gap-1">
      <Fwc2026EmblemIcon className="size-16" />
      <span className="font-display font-black text-[10px] tracking-[0.22em] uppercase">
        Legends
      </span>
    </span>
  ),
  /* wordmark muy ancho → h moderada + max-w para no desbordar */
  "coca-cola": <CocaColaIcon className="h-8 w-auto max-w-[6.5rem]" />,
};

type SectionKey = GroupCode | SpecialKey;

export function SectionTile({
  sectionKey,
  owned,
  total,
  viewer,
}: {
  sectionKey: SectionKey;
  owned: number;
  total: number;
  /** Si está, navega al view-only del perfil público en `/u/${viewer}/...`
   *  en vez del álbum propio del usuario logueado. */
  viewer?: string;
}) {
  const { accent, tint } = sectionPalette(sectionKey);
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
  const complete = total > 0 && owned === total;
  const isGroup = !(sectionKey in SPECIAL_SECTIONS);
  const flags = isGroup ? GROUP_TEAMS[sectionKey as GroupCode] : null;
  const special = !isGroup ? SPECIAL_SECTIONS[sectionKey as SpecialKey] : null;

  // Si estoy mirando el perfil de otra persona, las tiles apuntan al
  // view-only de esa persona, no al álbum propio del usuario logueado.
  const href = viewer
    ? isGroup
      ? `/u/${viewer}/grupo/${(sectionKey as string).toLowerCase()}`
      : `/u/${viewer}/${sectionKey}`
    : sectionHref(sectionKey);

  return (
    <Link
      href={href}
      className="group relative block rounded-2xl border bg-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:outline-none"
      style={
        {
          backgroundColor: tint,
          "--accent-section": accent,
        } as React.CSSProperties
      }
    >
      <div className="p-4 sm:p-5 aspect-square flex flex-col">
        <div className="flex items-start justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {sectionLabel(sectionKey)}
          </span>
          {complete && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: accent }}
            >
              <Check className="size-3" /> Completo
            </span>
          )}
        </div>

        <div className="flex-1 grid place-items-center">
          {isGroup ? (
            <span
              className="font-display font-bold leading-none"
              style={{ color: accent, fontSize: "clamp(3.5rem, 10vw, 5.5rem)" }}
            >
              {sectionKey}
            </span>
          ) : (
            <span style={{ color: accent }} aria-hidden>
              {special && SPECIAL_ICONS[sectionKey as SpecialKey]}
            </span>
          )}
        </div>

        {flags && (
          <div className="flex justify-center gap-1.5 text-xl leading-none mb-2">
            {flags.map((t) => (
              <span key={t.name} title={t.name} aria-hidden>
                {t.flag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-end justify-between gap-2">
            <span className="font-mono tabular text-sm font-semibold">
              {owned}/{total}
            </span>
            <span
              className="font-mono tabular text-xs"
              style={{ color: accent }}
            >
              {percent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, backgroundColor: accent }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
