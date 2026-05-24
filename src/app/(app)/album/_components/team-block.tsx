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
  groupCode,
  groupFlags,
  groupTint,
  groupAccent,
}: {
  teamName: string;
  teamFlag?: string;
  list: SectionSticker[];
  qtyMap: Map<string, number>;
  /** Para el Group Context Card en la hoja 2 */
  groupCode?: string;
  groupFlags?: Array<{ name: string; flag: string }>;
  groupTint?: string;
  groupAccent?: string;
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
          const isFirstPage = pageIndex === 0;
          const isSecondPage = pageIndex === 1;

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

              {isSecondPage ? (
                <Page2Grid
                  stickers={stickers}
                  qtyMap={qtyMap}
                  groupCode={groupCode}
                  groupFlags={groupFlags}
                  activeTeam={teamName}
                  tint={groupTint}
                  accent={groupAccent}
                />
              ) : (
                <Page1Grid
                  stickers={stickers}
                  qtyMap={qtyMap}
                  firstRowOnRight={isFirstPage}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Page1Grid({
  stickers,
  qtyMap,
  firstRowOnRight,
}: {
  stickers: SectionSticker[];
  qtyMap: Map<string, number>;
  firstRowOnRight: boolean;
}) {
  // Layout: ". . 1 2 / 3 4 5 6 / 7 8 9 10" (sticker #1 con sm:col-start-3)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
      {stickers.map((s, i) => {
        const positionClass =
          firstRowOnRight && i === 0 ? "sm:col-start-3" : undefined;
        return (
          <div key={s.id} className={positionClass}>
            <StickerCardSlot s={s} qtyMap={qtyMap} />
          </div>
        );
      })}
    </div>
  );
}

function Page2Grid({
  stickers,
  qtyMap,
  groupCode,
  groupFlags,
  activeTeam,
  tint,
  accent,
}: {
  stickers: SectionSticker[];
  qtyMap: Map<string, number>;
  groupCode?: string;
  groupFlags?: Array<{ name: string; flag: string }>;
  activeTeam: string;
  tint?: string;
  accent?: string;
}) {
  // Layout: "11 12 13H / 14 15 16 17 / [Grupo] 18 19 20"
  //  - sticker #13 (Team Photo) ocupa 2 columnas (horizontal)
  //  - GroupContextCard se inserta antes del sticker en posición 7 (sticker #18)
  const teamPhotoIdx = stickers.findIndex((s) => s.number === 13);
  const items: React.ReactNode[] = [];
  stickers.forEach((s, i) => {
    if (i === 7 && groupCode && groupFlags) {
      items.push(
        <GroupContextCard
          key="group-ctx"
          groupCode={groupCode}
          flags={groupFlags}
          activeTeam={activeTeam}
          tint={tint}
          accent={accent}
        />,
      );
    }
    const isTeamPhoto = i === teamPhotoIdx;
    items.push(
      <div key={s.id} className={isTeamPhoto ? "sm:col-span-2" : undefined}>
        <StickerCardSlot s={s} qtyMap={qtyMap} horizontal={isTeamPhoto} />
      </div>,
    );
  });
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 auto-rows-fr">
      {items}
    </div>
  );
}

function StickerCardSlot({
  s,
  qtyMap,
  horizontal,
}: {
  s: SectionSticker;
  qtyMap: Map<string, number>;
  horizontal?: boolean;
}) {
  return (
    <StickerCard
      id={s.id}
      code={s.code}
      number={s.number}
      name={s.name}
      team={s.team}
      type={s.type}
      initialQuantity={qtyMap.get(s.id) ?? 0}
      horizontal={horizontal}
    />
  );
}

function GroupContextCard({
  groupCode,
  flags,
  activeTeam,
  tint,
  accent,
}: {
  groupCode: string;
  flags: Array<{ name: string; flag: string }>;
  activeTeam: string;
  tint?: string;
  accent?: string;
}) {
  return (
    <div
      className="hidden sm:flex rounded-md border-2 flex-col items-center justify-center gap-2 p-2 text-center"
      style={{
        backgroundColor: tint,
        borderColor: accent,
      }}
    >
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Grupo
      </div>
      <div
        className="font-display text-2xl font-bold leading-none"
        style={{ color: accent }}
      >
        {groupCode}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {flags.map((f) => {
          const isActive = f.name === activeTeam;
          return (
            <span
              key={f.name}
              title={f.name}
              aria-hidden
              className="leading-none transition-all"
              style={{
                fontSize: isActive ? "1.5rem" : "0.85rem",
                opacity: isActive ? 1 : 0.55,
                filter: isActive ? "none" : "saturate(0.6)",
              }}
            >
              {f.flag}
            </span>
          );
        })}
      </div>
    </div>
  );
}
