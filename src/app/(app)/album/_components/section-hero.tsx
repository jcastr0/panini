import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export function SectionHero({
  accent,
  tint,
  badge,
  letter,
  subtitle,
  flags,
  owned,
  total,
  ownerProps,
}: {
  accent: string;
  tint: string;
  badge: string;
  /** Lo que va GRANDE al lado de la lámina (la letra del grupo o un emoji) */
  letter: React.ReactNode;
  subtitle?: string;
  flags?: Array<{ name: string; flag: string }>;
  owned: number;
  total: number;
  ownerProps: {
    username: string;
    displayName: string | null;
    collectorCardBase64: string | null;
    avatarUrl: string | null;
  };
}) {
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
  const cardSrc = ownerProps.collectorCardBase64
    ? `data:image/jpeg;base64,${ownerProps.collectorCardBase64}`
    : ownerProps.avatarUrl;
  const initials = (ownerProps.displayName || ownerProps.username || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <section
      className="relative -mx-6 px-6 py-8 sm:py-10 rounded-b-3xl border-b"
      style={{ backgroundColor: tint }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Link
            href="/album"
            className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 text-sm font-medium hover:bg-card transition-colors"
          >
            <ArrowLeft className="size-4" /> Mi álbum
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end">
          <div className="space-y-4">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              {badge}
            </span>

            {/* Letra + Lámina lado a lado: la lámina es la protagonista */}
            <div className="flex items-end gap-4 sm:gap-6">
              <div
                className="font-display font-bold leading-[0.85] tracking-tighter"
                style={{
                  color: accent,
                  fontSize: "clamp(4.5rem, 18vw, 10rem)",
                }}
              >
                {letter}
              </div>

              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative w-24 sm:w-28 lg:w-32 aspect-[3/4] rounded-lg overflow-hidden ring-2 shadow-lg"
                  style={{ borderColor: accent, boxShadow: `0 8px 20px -8px ${accent}55` }}
                >
                  {cardSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cardSrc}
                      alt={`Lámina de @${ownerProps.username}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-card grid place-items-center text-2xl font-bold text-muted-foreground">
                      {initials || "?"}
                    </div>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-tight max-w-[8rem]">
                  Álbum de
                  <br />
                  <span className="font-semibold text-foreground">
                    @{ownerProps.username || "tu"}
                  </span>
                </p>
              </div>
            </div>

            {subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base">
                {subtitle}
              </p>
            )}
            {flags && flags.length > 0 && (
              <div className="flex gap-2 text-2xl sm:text-3xl leading-none">
                {flags.map((t) => (
                  <span key={t.name} title={t.name} aria-hidden>
                    {t.flag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-[200px] lg:min-w-[260px] space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className="font-display text-4xl font-bold tabular"
                style={{ color: accent }}
              >
                {percent}%
              </span>
              <span className="font-mono tabular text-sm text-muted-foreground">
                {owned}/{total}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-background/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: accent }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionFooterNav({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  return (
    <nav className="border-t pt-6 flex items-center justify-between gap-3">
      {prev ? (
        <Link
          href={prev.href}
          className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" /> {prev.label}
        </Link>
      ) : (
        <span />
      )}
      <Link
        href="/album"
        className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
      >
        Mi álbum
      </Link>
      {next ? (
        <Link
          href={next.href}
          className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
        >
          {next.label} <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
