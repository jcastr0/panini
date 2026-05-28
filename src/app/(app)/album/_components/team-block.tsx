import { StickerCard } from "./sticker-card";
import type { TeamInfo } from "@/lib/album-config";

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
  teamInfo,
  list,
  qtyMap,
  groupCode,
  groupFlags,
  tint,
  accent,
  readOnly = false,
}: {
  teamName: string;
  teamFlag?: string;
  /** Datos canónicos del equipo para el header (bandera SVG, federación...) */
  teamInfo?: TeamInfo;
  list: SectionSticker[];
  qtyMap: Map<string, number>;
  /** Para el Group Context Card en la hoja 2 */
  groupCode?: string;
  groupFlags?: Array<{ name: string; flag: string }>;
  /** Tint pastel del equipo activo — pinta el fondo de las dos hojas */
  tint?: string;
  /** Accent del equipo activo — borde sutil de las hojas */
  accent?: string;
  /** Vista del álbum de otro usuario — sin controles +/-. */
  readOnly?: boolean;
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
              className="rounded-xl p-4 relative space-y-3 ring-1"
              style={{
                backgroundColor: tint,
                // ring sutil del color del país (4px alpha → casi invisible)
                ["--tw-ring-color" as string]: accent
                  ? `${accent.replace(")", " / 0.18)")}`
                  : undefined,
              }}
            >
              <div
                className="absolute -top-2 left-4 px-2"
                style={{ backgroundColor: tint }}
              >
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
                  accent={accent}
                  readOnly={readOnly}
                />
              ) : (
                <Page1Grid
                  stickers={stickers}
                  qtyMap={qtyMap}
                  teamInfo={isFirstPage ? teamInfo : undefined}
                  accent={accent}
                  readOnly={readOnly}
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
  teamInfo,
  accent,
  readOnly,
}: {
  stickers: SectionSticker[];
  qtyMap: Map<string, number>;
  /** Cuando se proporciona, ocupa el espacio vacío izquierdo de la hoja 1 */
  teamInfo?: TeamInfo;
  accent?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
      {teamInfo && (
        <div className="col-span-2 row-span-1">
          <TeamHeaderCell info={teamInfo} accent={accent} />
        </div>
      )}
      {stickers.map((s) => (
        <div key={s.id}>
          <StickerCardSlot s={s} qtyMap={qtyMap} readOnly={readOnly} />
        </div>
      ))}
    </div>
  );
}

/**
 * Cabecera de país que ocupa el espacio vacío de la hoja 1 (col-span-2):
 *   ┌──────────────────────┐
 *   │   [BANDERA SVG]      │
 *   │   WE ARE,            │
 *   │   MEXICO             │
 *   │   ─────              │
 *   │   Federación...      │
 *   │   MEX · CONCACAF     │
 *   └──────────────────────┘
 */
function TeamHeaderCell({
  info,
  accent,
}: {
  info: TeamInfo;
  accent?: string;
}) {
  return (
    <div
      className="h-full rounded-lg bg-card border-2 p-3 sm:p-4 flex flex-col justify-between gap-2 shadow-sm overflow-hidden relative"
      style={{ borderColor: accent }}
    >
      {/* Fila superior: bandera + balón + código país protagonista */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`fi fi-${info.iso} rounded-sm shadow-md ring-1 ring-black/10`}
            style={{
              width: "clamp(2.25rem, 7vw, 3.5rem)",
              height: "clamp(1.5rem, 4.6vw, 2.34rem)",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
            aria-label={`Bandera de ${info.name}`}
          />
          <span
            className="leading-none select-none"
            style={{ fontSize: "clamp(1.1rem, 3.2vw, 1.6rem)" }}
            aria-hidden
          >
            ⚽
          </span>
        </div>
        <span
          className="font-mono font-black leading-none tabular tracking-tight"
          style={{
            color: accent,
            fontSize: "clamp(2rem, 7vw, 3.25rem)",
          }}
          aria-label={`Código ${info.paniniCode}`}
        >
          {info.paniniCode}
        </span>
      </div>

      {/* WE ARE, COUNTRY — más sutil ahora que el código manda */}
      <div className="leading-tight">
        <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          We are,
        </div>
        <div
          className="font-display font-bold tracking-tight uppercase break-words leading-[0.95]"
          style={{
            color: accent,
            fontSize: "clamp(0.95rem, 2.6vw, 1.4rem)",
          }}
        >
          {info.englishName}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] sm:text-xs font-medium text-foreground/85 leading-snug">
          {info.federationName}
        </p>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {info.confederation}
        </span>
      </div>
    </div>
  );
}

function Page2Grid({
  stickers,
  qtyMap,
  groupCode,
  groupFlags,
  activeTeam,
  accent,
  readOnly,
}: {
  stickers: SectionSticker[];
  qtyMap: Map<string, number>;
  groupCode?: string;
  groupFlags?: Array<{ name: string; flag: string }>;
  activeTeam: string;
  accent?: string;
  readOnly?: boolean;
}) {
  // Layout: "11 12 13H / 14 15 16 17 / [Grupo] 18 19 20"
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
          accent={accent}
        />,
      );
    }
    const isTeamPhoto = i === teamPhotoIdx;
    items.push(
      <div key={s.id} className={isTeamPhoto ? "sm:col-span-2" : undefined}>
        <StickerCardSlot
          s={s}
          qtyMap={qtyMap}
          horizontal={isTeamPhoto}
          readOnly={readOnly}
        />
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
  readOnly,
}: {
  s: SectionSticker;
  qtyMap: Map<string, number>;
  horizontal?: boolean;
  readOnly?: boolean;
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
      readOnly={readOnly}
    />
  );
}

function GroupContextCard({
  groupCode,
  flags,
  activeTeam,
  accent,
}: {
  groupCode: string;
  flags: Array<{ name: string; flag: string }>;
  activeTeam: string;
  accent?: string;
}) {
  // Sin recuadro: asienta sobre el fondo pastel de la hoja.
  // 4 banderas en 2x2 → activa más grande, inactivas más chicas.
  return (
    <div className="hidden sm:flex flex-col items-center justify-center gap-1 p-1 text-center">
      <div className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
        Grupo
      </div>
      <div
        className="font-display text-xl font-bold leading-none"
        style={{ color: accent }}
      >
        {groupCode}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5">
        {flags.map((f) => {
          const isActive = f.name === activeTeam;
          return (
            <span
              key={f.name}
              title={f.name}
              aria-hidden
              className="leading-none transition-all"
              style={{
                fontSize: isActive ? "1.9rem" : "1.1rem",
                opacity: isActive ? 1 : 0.5,
                filter: isActive ? "none" : "saturate(0.5)",
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
