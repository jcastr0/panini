import { Bone, sh } from "./skeleton-primitives";

/* ────────────────────────────────────────────────────────────────────────── */
/*  Album index — /album                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function ProgressRingGhost() {
  return (
    <div
      className="relative shrink-0"
      style={{ width: 160, height: 160 }}
    >
      <svg viewBox="0 0 160 160" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="80" cy="80" r="62"
          fill="none"
          strokeWidth="14"
          style={{ stroke: "var(--muted)" }}
        />
        <circle
          cx="80" cy="80" r="62"
          fill="none"
          strokeWidth="14"
          strokeDasharray="390"
          strokeDashoffset="270"
          strokeLinecap="round"
          style={{
            stroke: "var(--panini-blue)",
            opacity: 0.25,
            animation: "panini-shimmer 2s ease-in-out infinite",
            animationDelay: "200ms",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Bone className="h-7 w-12" delay={80} />
        <Bone className="h-2.5 w-16" delay={140} />
      </div>
    </div>
  );
}

function SectionTileGhost({ idx }: { idx: number }) {
  const d = idx * 35;
  return (
    <div
      className="aspect-square rounded-2xl overflow-hidden"
      style={sh(d)}
    >
      <div className="p-4 h-full flex flex-col justify-between">
        <Bone className="h-2 w-10" delay={d + 60} />
        <Bone className="h-8 w-8 mx-auto rounded-lg" delay={d + 90} />
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Bone className="h-2.5 w-10" delay={d + 110} />
            <Bone className="h-2.5 w-6" delay={d + 130} />
          </div>
          <div className="h-1.5 w-full rounded-full" style={sh(d + 150)} />
        </div>
      </div>
    </div>
  );
}

export function AlbumLoading() {
  return (
    <div className="space-y-10">
      {/* Owner + progress */}
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bone className="size-8 rounded-full shrink-0" delay={0} />
            <Bone className="h-3 w-28" delay={40} />
          </div>
          <Bone className="h-2.5 w-20" delay={60} />
        </div>

        <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
          <div className="flex items-center gap-4">
            <ProgressRingGhost />
            <div className="hidden sm:block w-24 aspect-[3/4] rounded-lg" style={sh(300)} />
          </div>
          <div className="space-y-3">
            <Bone className="h-8 w-52" delay={180} />
            <Bone className="h-4 w-72 max-w-full" delay={220} />
            <Bone className="h-3.5 w-44" delay={260} />
          </div>
        </div>
      </section>

      {/* Section tiles */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <Bone className="h-6 w-32" delay={300} />
          <Bone className="h-2.5 w-20" delay={340} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <SectionTileGhost key={i} idx={i} />
          ))}
        </div>
      </section>

      {/* Promo card */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Bone className="size-8 rounded-full shrink-0" delay={560} />
            <div className="space-y-1.5">
              <Bone className="h-4 w-40" delay={580} />
              <Bone className="h-3 w-56" delay={610} />
            </div>
          </div>
          <Bone className="h-10 w-36 rounded-full" delay={640} />
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Collection — /collection                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

function StickerRowGhost({ delay }: { delay: number }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50">
      <Bone className="size-10 rounded-lg shrink-0" delay={delay} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Bone className="h-3 w-32" delay={delay + 40} />
        <Bone className="h-2.5 w-20" delay={delay + 70} />
      </div>
      <Bone className="h-6 w-12 rounded-full shrink-0" delay={delay + 90} />
    </div>
  );
}

export function CollectionLoading() {
  return (
    <div className="space-y-8">
      {/* Owner tag */}
      <div className="flex items-center gap-3">
        <Bone className="size-8 rounded-full shrink-0" delay={0} />
        <Bone className="h-3 w-28" delay={40} />
      </div>

      {/* Stats header */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="space-y-1.5">
            <Bone className="h-8 w-48" delay={80} />
            <Bone className="h-3 w-36" delay={120} />
          </div>
          <div className="space-y-1.5 text-right">
            <Bone className="h-5 w-16 ml-auto" delay={140} />
            <Bone className="h-2.5 w-24 ml-auto" delay={160} />
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full overflow-hidden" style={sh(180)} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b pb-0">
        {[80, 60, 70].map((w, i) => (
          <Bone key={i} className={`h-8 w-${w === 80 ? 20 : w === 60 ? 16 : 18} rounded-t-lg`} delay={200 + i * 40} />
        ))}
      </div>

      {/* Sticker list */}
      <div>
        {Array.from({ length: 12 }).map((_, i) => (
          <StickerRowGhost key={i} delay={280 + i * 45} />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Trades — /trades                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function TradeCardGhost({ delay }: { delay: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bone className="size-8 rounded-full shrink-0" delay={delay} />
          <div className="space-y-1">
            <Bone className="h-3 w-28" delay={delay + 40} />
            <Bone className="h-2.5 w-16" delay={delay + 70} />
          </div>
        </div>
        <Bone className="h-5 w-20 rounded-full shrink-0" delay={delay + 80} />
      </div>
      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2].map((j) => (
          <Bone key={j} className="h-6 w-16 rounded-full" delay={delay + 100 + j * 30} />
        ))}
      </div>
      <Bone className="h-3 w-full" delay={delay + 190} />
    </div>
  );
}

export function TradesLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Bone className="h-7 w-36" delay={0} />
          <Bone className="h-3 w-52" delay={40} />
        </div>
        <Bone className="h-10 w-32 rounded-full shrink-0" delay={60} />
      </div>

      {/* Incoming */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bone className="size-4 rounded" delay={80} />
          <Bone className="h-4 w-24" delay={100} />
          <Bone className="h-5 w-8 rounded-full ml-1" delay={120} />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <TradeCardGhost key={i} delay={140 + i * 80} />)}
        </div>
      </section>

      {/* Outgoing */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bone className="size-4 rounded" delay={380} />
          <Bone className="h-4 w-24" delay={400} />
        </div>
        <div className="space-y-3">
          {[0, 1].map((i) => <TradeCardGhost key={i} delay={420 + i * 80} />)}
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Amigos — /amigos                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function FriendCardGhost({ delay }: { delay: number }) {
  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Bone className="size-12 rounded-full shrink-0" delay={delay} />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Bone className="h-3.5 w-28" delay={delay + 40} />
          <Bone className="h-2.5 w-16" delay={delay + 70} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <Bone className="h-2.5 w-10" delay={delay + 90} />
          <Bone className="h-2.5 w-8" delay={delay + 110} />
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={sh(delay + 130)} />
      </div>
      <Bone className="h-8 w-full rounded-full" delay={delay + 160} />
    </div>
  );
}

export function AmigosLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Bone className="h-7 w-32" delay={0} />
        <Bone className="h-3 w-56" delay={40} />
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-3 rounded-full border bg-card px-4 h-12"
        style={sh(60)}
      >
        <Bone className="size-4 rounded shrink-0" delay={80} />
        <Bone className="h-3 flex-1" delay={100} />
      </div>

      {/* Share card */}
      <div className="rounded-2xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Bone className="size-10 rounded-full shrink-0" delay={120} />
          <div className="space-y-1.5 flex-1">
            <Bone className="h-4 w-40" delay={140} />
            <Bone className="h-2.5 w-56" delay={160} />
          </div>
        </div>
        <Bone className="h-9 w-full rounded-lg" delay={180} />
      </div>

      {/* Friend grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <FriendCardGhost key={i} delay={220 + i * 50} />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Profile — /profile                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export function ProfileLoading() {
  return (
    <div className="space-y-8 max-w-xl">
      {/* Header */}
      <div className="space-y-3">
        <Bone className="h-2.5 w-14" delay={0} />
        <Bone className="h-9 w-36" delay={40} />
        <Bone className="h-3 w-72 max-w-full" delay={80} />
      </div>

      {/* Collector card upload */}
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="w-24 shrink-0 rounded-xl overflow-hidden"
            style={{ aspectRatio: "3/4", ...sh(120) }}
          />
          <div className="flex-1 space-y-3 pt-1">
            <Bone className="h-4 w-40" delay={140} />
            <Bone className="h-3 w-56" delay={170} />
            <Bone className="h-3 w-48" delay={200} />
            <Bone className="h-9 w-36 rounded-full mt-2" delay={230} />
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        {[
          { label: 120, input: 260 },
          { label: 110, input: 200 },
          { label: 100, input: 180 },
          { label: 115, input: 220 },
        ].map(({ label, input }, i) => (
          <div key={i} className="space-y-1.5">
            <Bone className={`h-3 w-${label > 115 ? 24 : label > 100 ? 20 : 16}`} delay={320 + i * 60} />
            <div className="h-10 w-full rounded-lg" style={sh(340 + i * 60)} />
          </div>
        ))}
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <Bone className="h-3.5 w-32" delay={560} />
          <Bone className="h-2.5 w-52" delay={590} />
        </div>
        <Bone className="h-6 w-11 rounded-full shrink-0" delay={610} />
      </div>

      {/* Save button */}
      <Bone className="h-10 w-28 rounded-full" delay={640} />

      {/* Friends link */}
      <div className="rounded-xl border p-4 flex items-center gap-3">
        <Bone className="size-10 rounded-full shrink-0" delay={680} />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-3.5 w-28" delay={700} />
          <Bone className="h-2.5 w-44" delay={720} />
        </div>
        <Bone className="size-4 rounded shrink-0" delay={740} />
      </div>
    </div>
  );
}
