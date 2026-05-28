import { ArrowLeft } from "lucide-react";

/* ─── Shimmer helper ─────────────────────────────────────────────────────── */

function sh(delay = 0): React.CSSProperties {
  return {
    backgroundImage:
      "linear-gradient(110deg, var(--muted) 0%, var(--muted) 35%, var(--card) 50%, var(--muted) 65%, var(--muted) 100%)",
    backgroundSize: "300% 100%",
    animation: `panini-shimmer 1.9s ease-in-out infinite`,
    animationDelay: `${delay}ms`,
  };
}

/* ─── Primitive: text / block bone ──────────────────────────────────────── */

function Bone({
  className = "",
  delay = 0,
  style,
}: {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return <div className={`rounded-md ${className}`} style={{ ...sh(delay), ...style }} />;
}

/* ─── Sticker slot ghost ─────────────────────────────────────────────────── */

function SlotGhost({ idx }: { idx: number }) {
  const d = idx * 52;
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-dashed"
      style={{
        aspectRatio: "3 / 4",
        borderColor: "color-mix(in oklch, var(--border) 55%, transparent)",
        ...sh(d),
      }}
    >
      {/* inner image area — slightly brighter band */}
      <div
        className="absolute inset-x-2 rounded-lg"
        style={{ top: "18%", bottom: "22%", ...sh(d + 60), opacity: 0.6 }}
      />
      {/* number tag */}
      <div
        className="absolute top-2 left-2 h-2 w-7 rounded-full"
        style={sh(d + 90)}
      />
      {/* type tag */}
      <div
        className="absolute top-2 right-2 h-2 w-9 rounded-full"
        style={sh(d + 110)}
      />
      {/* name line */}
      <div
        className="absolute bottom-2.5 left-2 h-2 rounded-full"
        style={{ width: "65%", ...sh(d + 130) }}
      />
    </div>
  );
}

/* ─── Horizontal (wide) slot ghost — for historia / apertura portadas ─────── */

function SlotGhostWide({ idx }: { idx: number }) {
  const d = idx * 52;
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-dashed"
      style={{
        aspectRatio: "4 / 3",
        borderColor: "color-mix(in oklch, var(--border) 55%, transparent)",
        ...sh(d),
      }}
    >
      <div
        className="absolute inset-y-2 rounded-lg"
        style={{ left: "2%", right: "25%", ...sh(d + 60), opacity: 0.6 }}
      />
      <div className="absolute bottom-2.5 left-2 h-2 w-1/2 rounded-full" style={sh(d + 120)} />
    </div>
  );
}

/* ─── One page panel ─────────────────────────────────────────────────────── */

function PagePanel({
  titleDelay,
  count,
  offset,
  wide = false,
  grid,
}: {
  titleDelay: number;
  count: number;
  offset: number;
  wide?: boolean;
  grid?: string;
}) {
  const defaultGrid = wide
    ? "grid-cols-1 gap-3"
    : "grid-cols-2 sm:grid-cols-3 gap-3";
  return (
    <div className="border rounded-xl bg-card p-4 space-y-4 relative">
      {/* "Página XX" floating tag */}
      <div className="absolute -top-2.5 left-4 px-2 bg-background">
        <Bone className="h-2 w-14" delay={titleDelay} />
      </div>
      {/* Title + count */}
      <div className="flex items-end justify-between pt-1.5 gap-4">
        <Bone className="h-5 w-40" delay={titleDelay + 70} />
        <Bone className="h-3 w-8 shrink-0" delay={titleDelay + 110} />
      </div>
      {/* Grid */}
      <div className={`grid ${grid ?? defaultGrid}`}>
        {Array.from({ length: count }).map((_, i) =>
          wide ? (
            <SlotGhostWide key={i} idx={offset + i} />
          ) : (
            <SlotGhost key={i} idx={offset + i} />
          ),
        )}
      </div>
    </div>
  );
}

/* ─── PUBLIC API ─────────────────────────────────────────────────────────── */

/**
 * SectionLoading — skeleton para secciones especiales (apertura, historia,
 * legends, coca-cola). Acepta tint y accent para que el hero skeleton tenga
 * la identidad visual de la sección mientras carga.
 */
export function SectionLoading({
  tint = "transparent",
  accent = "var(--muted-foreground)",
  wide = false,
  legendsGrid = false,
}: {
  tint?: string;
  accent?: string;
  /** Historia y pares apertura: slots horizontales */
  wide?: boolean;
  /** Legends: 4 columnas en desktop */
  legendsGrid?: boolean;
}) {
  const grid = legendsGrid
    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
    : undefined;

  return (
    <div className="space-y-10">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative -mx-6 px-6 py-8 sm:py-10 rounded-b-3xl border-b"
        style={{ backgroundColor: tint }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Back button ghost */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 pointer-events-none">
              <ArrowLeft className="size-4 text-muted-foreground/40" />
              <Bone className="h-3 w-16" delay={0} />
            </div>
          </div>

          {/* Letter / icon | Collector card */}
          <div className="grid grid-cols-[1fr_auto] gap-4 sm:gap-8 items-center">
            <div className="min-w-0 space-y-3 sm:space-y-4">
              {/* Badge label */}
              <Bone className="h-2.5 w-28" delay={60} />

              {/* Big icon / letter ghost — pulses con el accent de la sección */}
              <div
                className="rounded-2xl animate-pulse"
                style={{
                  height: "clamp(4.5rem, 20vw, 11rem)",
                  width: "clamp(4.5rem, 20vw, 11rem)",
                  backgroundColor: accent,
                  opacity: 0.13,
                }}
              />

              {/* Subtitle */}
              <Bone className="h-3 w-56 sm:w-72" delay={200} />
            </div>

            {/* Collector card */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="w-20 sm:w-24 lg:w-28 rounded-lg overflow-hidden"
                style={{ aspectRatio: "3/4", ...sh(280) }}
              />
              <Bone className="h-2.5 w-16" delay={340} />
            </div>
          </div>

          {/* Progress row */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Bone className="h-8 w-16 rounded-xl shrink-0" delay={380} />
              <div
                className="flex-1 h-2.5 rounded-full overflow-hidden"
                style={{ background: "var(--background)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "32%",
                    backgroundColor: accent,
                    opacity: 0.25,
                    animation: "panini-shimmer 2.2s ease-in-out infinite",
                    animationDelay: "420ms",
                    backgroundImage:
                      "linear-gradient(90deg, transparent 0%, color-mix(in oklch, var(--card) 40%, transparent) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
              <Bone className="h-3 w-14 shrink-0" delay={440} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKER PANELS ──────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PagePanel titleDelay={180} count={wide ? 2 : 4} offset={0}  wide={wide} grid={grid} />
        <PagePanel titleDelay={240} count={wide ? 3 : 5} offset={4}  wide={wide} grid={grid} />
        <PagePanel titleDelay={300} count={wide ? 2 : 6} offset={9}  wide={wide} grid={grid} />
        <PagePanel titleDelay={360} count={wide ? 3 : 5} offset={15} wide={wide} grid={grid} />
      </div>

      {/* ── FOOTER NAV ──────────────────────────────────────────────────── */}
      <div className="border-t pt-6 flex items-center justify-between gap-3">
        <Bone className="h-10 w-28 rounded-full" delay={560} />
        <Bone className="h-3 w-16" delay={600} />
        <Bone className="h-10 w-28 rounded-full" delay={640} />
      </div>
    </div>
  );
}

/* ─── Group page skeleton ────────────────────────────────────────────────── */

function TeamBlockGhost({ letterDelay, offset }: { letterDelay: number; offset: number }) {
  return (
    <div className="space-y-4">
      {/* Team header */}
      <div className="flex items-center gap-3">
        <Bone className="size-8 rounded-full shrink-0" delay={letterDelay} />
        <Bone className="h-4 w-32" delay={letterDelay + 60} />
        <div className="flex-1" />
        <Bone className="h-3 w-10" delay={letterDelay + 100} />
      </div>
      {/* Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SlotGhost key={i} idx={offset + i} />
        ))}
      </div>
    </div>
  );
}

export function GroupLoading({ accent = "var(--muted-foreground)", tint = "transparent" }: { accent?: string; tint?: string }) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section
        className="relative -mx-6 px-6 py-8 sm:py-10 rounded-b-3xl border-b"
        style={{ backgroundColor: tint }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 pointer-events-none">
              <ArrowLeft className="size-4 text-muted-foreground/40" />
              <Bone className="h-3 w-16" delay={0} />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4 sm:gap-8 items-center">
            <div className="min-w-0 space-y-3 sm:space-y-4">
              <Bone className="h-2.5 w-28" delay={60} />
              {/* Group letter ghost — matches the big letter in the real hero */}
              <div
                className="rounded-xl animate-pulse"
                style={{
                  height: "clamp(5rem, 22vw, 14rem)",
                  width: "clamp(5rem, 22vw, 14rem)",
                  backgroundColor: accent,
                  opacity: 0.12,
                }}
              />
              <Bone className="h-3 w-48 sm:w-64" delay={200} />
              {/* Flag row */}
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} className="size-8 rounded-full" delay={260 + i * 40} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="w-20 sm:w-24 lg:w-28 rounded-lg overflow-hidden"
                style={{ aspectRatio: "3/4", ...sh(300) }}
              />
              <Bone className="h-2.5 w-16" delay={360} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 sm:gap-4">
              <Bone className="h-8 w-16 rounded-xl shrink-0" delay={400} />
              <div className="flex-1 h-2.5 rounded-full" style={{ background: "var(--background)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "45%",
                    backgroundColor: accent,
                    opacity: 0.2,
                    animation: "panini-shimmer 2.2s ease-in-out infinite 440ms",
                  }}
                />
              </div>
              <Bone className="h-3 w-14 shrink-0" delay={460} />
            </div>
          </div>
        </div>
      </section>

      {/* Team blocks */}
      <div className="space-y-10">
        <TeamBlockGhost letterDelay={200} offset={0}  />
        <TeamBlockGhost letterDelay={280} offset={5}  />
        <TeamBlockGhost letterDelay={360} offset={10} />
        <TeamBlockGhost letterDelay={440} offset={15} />
      </div>

      {/* Footer */}
      <div className="border-t pt-6 flex items-center justify-between gap-3">
        <Bone className="h-10 w-28 rounded-full" delay={560} />
        <Bone className="h-3 w-16" delay={600} />
        <Bone className="h-10 w-28 rounded-full" delay={640} />
      </div>
    </div>
  );
}
