import { StickerCard } from "./sticker-card";

export type SectionSticker = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  page: number | null;
};

export function TeamBlock({
  teamName,
  teamFlag,
  list,
  qtyMap,
}: {
  teamName: string;
  teamFlag?: string;
  list: SectionSticker[];
  qtyMap: Map<string, number>;
}) {
  const pagesMap = new Map<number, SectionSticker[]>();
  list.forEach((s) => {
    const p = s.page ?? 0;
    if (!pagesMap.has(p)) pagesMap.set(p, []);
    pagesMap.get(p)!.push(s);
  });
  const pages = [...pagesMap.entries()].sort(([a], [b]) => a - b);
  const ownedInTeam = list.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;
  const teamCode = list[0]?.code?.replace(/\d+$/, "") ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          {teamFlag && (
            <span className="text-xl leading-none" aria-hidden>
              {teamFlag}
            </span>
          )}
          <h3 className="font-display text-xl font-semibold tracking-tight">
            {teamName}
          </h3>
          {teamCode && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {teamCode}
            </span>
          )}
        </div>
        <span className="font-mono text-sm text-muted-foreground tabular">
          {ownedInTeam}/{list.length}
        </span>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {pages.map(([page, stickers], pageIndex) => {
          const ownedInPage = stickers.filter(
            (s) => (qtyMap.get(s.id) ?? 0) >= 1,
          ).length;
          // Layout 2/4/4 imitando el álbum real:
          //   - Página izquierda (índice 0): primera fila a la DERECHA
          //   - Página derecha  (índice 1): primera fila a la IZQUIERDA (default)
          const firstRowOnRight = pageIndex === 0;
          return (
            <div
              key={page}
              className="border rounded-xl bg-card p-4 relative space-y-3"
            >
              <div className="absolute -top-2 left-4 px-2 bg-background">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Página {String(page).padStart(2, "0")} · {ownedInPage}/
                  {stickers.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {stickers.map((s, i) => {
                  // Posicionamiento sólo en desktop (sm+). En móvil flow normal de 2 cols.
                  let positionClass: string | undefined;
                  if (firstRowOnRight && i === 0) {
                    // Empuja el primer sticker a la col 3 → row 1 = ". . 1 2"
                    positionClass = "sm:col-start-3";
                  } else if (!firstRowOnRight && i === 2) {
                    // Después de los 2 primeros, forza salto: row 1 = "1 2 . ."
                    positionClass = "sm:col-start-1";
                  }
                  return (
                    <div key={s.id} className={positionClass}>
                      <StickerCard
                        id={s.id}
                        code={s.code}
                        number={s.number}
                        name={s.name}
                        team={s.team}
                        type={s.type}
                        initialQuantity={qtyMap.get(s.id) ?? 0}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
