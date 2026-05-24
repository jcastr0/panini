import { StickerCard } from "./sticker-card";
import type { SectionSticker } from "./team-block";

/**
 * Render de páginas tipo "panel" para secciones sin equipos
 * (Apertura, Historia, Coca-Cola).
 */
export function SpecialSection({
  pages,
  qtyMap,
  pageTitles,
}: {
  pages: Array<[number, SectionSticker[]]>;
  qtyMap: Map<string, number>;
  pageTitles: Record<number, string>;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {pages.map(([page, list]) => {
        const ownedInPage = list.filter(
          (s) => (qtyMap.get(s.id) ?? 0) >= 1,
        ).length;
        return (
          <div
            key={page}
            className="border rounded-xl bg-card p-4 space-y-3 relative"
          >
            <div className="absolute -top-2 left-4 px-2 bg-background">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Página {String(page).padStart(2, "0")}
              </span>
            </div>
            <div className="flex items-end justify-between pt-1">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {pageTitles[page] ?? `Página ${page}`}
              </h3>
              <span className="font-mono text-sm text-muted-foreground tabular">
                {ownedInPage}/{list.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {list.map((s) => (
                <StickerCard
                  key={s.id}
                  id={s.id}
                  code={s.code}
                  number={s.number}
                  name={s.name}
                  team={s.team}
                  type={s.type}
                  initialQuantity={qtyMap.get(s.id) ?? 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
