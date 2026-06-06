import { cn } from "@/lib/utils";
import { StickerCard } from "./sticker-card";
import type { SectionSticker } from "./team-block";
import type { SpecialKey } from "@/lib/album-config";

/**
 * Render de páginas tipo "panel" para secciones sin equipos
 * (Apertura, Historia, Legends, Coca-Cola).
 *
 * Caso especial: la página "El Trofeo" (page=1 en apertura) tiene
 * únicamente dos cromos — Trofeo Superior y Trofeo Inferior — y la
 * idea es que se vean apilados verticalmente como un trofeo único.
 */
export function SpecialSection({
  pages,
  qtyMap,
  pageTitles,
  readOnly = false,
  sectionKey,
}: {
  pages: Array<[number, SectionSticker[]]>;
  qtyMap: Map<string, number>;
  pageTitles: Record<number, string>;
  /** Vista del álbum de otro usuario — sin controles +/-. */
  readOnly?: boolean;
  /** Sección actual — controla layouts especiales (ej. historia all-horizontal). */
  sectionKey?: SpecialKey;
}) {
  const isHistoria = sectionKey === "historia";
  return (
    // pages.map loop renders below
    <div className="grid lg:grid-cols-2 gap-6">
      {pages.map(([page, list]) => {
        const ownedInPage = list.filter(
          (s) => (qtyMap.get(s.id) ?? 0) >= 1,
        ).length;
        const isTrofeo = list.length === 2 && list.every((s) => s.number === 1 || s.number === 2);
        const isLegends = sectionKey === "legends";
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
            <div
              className={cn(
                "grid",
                isTrofeo
                  ? "grid-cols-1 max-w-[220px] mx-auto gap-0"
                  : isHistoria
                    ? "grid-cols-1 gap-3"
                    : isLegends
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                      : "grid-cols-2 sm:grid-cols-3 gap-3",
              )}
            >
              {list.map((s) => {
                // Cromos horizontales por diseño:
                //   - Apertura #0 (Panini chilena) y #3 (Mascotas): col-span-2 + tall
                //   - Historia (page 99): todas son team photos → tall en su grid-cols-1
                //   - Legends y Coca-Cola: NUNCA horizontales (todas son verticales 3:4)
                // Sus archivos JPG están ya rotados a horizontal (560×420).
                const isApertura = sectionKey === "apertura";
                const isHorizontalApertura =
                  isApertura && !isTrofeo && (s.number === 0 || s.number === 3);
                const horizontal = (isHorizontalApertura || isHistoria) && !isLegends;
                return (
                  <div
                    key={s.id}
                    id={s.code ?? undefined}
                    className={cn(
                      "scroll-mt-24",
                      isHorizontalApertura && "col-span-2 sm:col-span-2",
                    )}
                  >
                    <StickerCard
                      id={s.id}
                      code={s.code}
                      number={s.number}
                      name={s.name}
                      team={s.team}
                      type={s.type}
                      initialQuantity={qtyMap.get(s.id) ?? 0}
                      horizontal={horizontal}
                      tall={horizontal}
                      trofeoHalf={
                        isTrofeo
                          ? s.number === 1
                            ? "top"
                            : "bottom"
                          : undefined
                      }
                      readOnly={readOnly}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
