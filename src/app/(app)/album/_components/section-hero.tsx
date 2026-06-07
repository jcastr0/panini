import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CollectorCardLightbox } from "./collector-card-lightbox";

export function SectionHero({
  accent,
  tint,
  badge,
  letter,
  subtitle,
  flags,
  owned,
  total,
  context,
  ownerProps,
  backHref = "/album",
  backLabel = "Mi álbum",
  nextHref,
  nextLabel,
}: {
  accent: string;
  tint: string;
  badge: string;
  /** Lo que va GRANDE al lado de la lámina (la letra del grupo o un emoji) */
  letter: React.ReactNode;
  subtitle?: string;
  flags?: Array<{ name: string; flag: string }>;
  /** Cromos owned y total del scope ACTUAL (equipo si paginado, sección si no) */
  owned: number;
  total: number;
  /** Línea de contexto opcional (ej. "Grupo A · 25/80 · 31%") */
  context?: string;
  ownerProps: {
    username: string;
    displayName: string | null;
    collectorCardBase64: string | null;
    avatarUrl: string | null;
  };
  /** Link de regreso (default: /album). Personalízalo en vistas /u/:username/... */
  backHref?: string;
  backLabel?: string;
  /** Opcional: salto rápido al siguiente bloque (ej. siguiente grupo). */
  nextHref?: string;
  nextLabel?: string;
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
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 text-sm font-medium hover:bg-card transition-colors"
          >
            <ArrowLeft className="size-4" /> {backLabel}
          </Link>
          {nextHref && nextLabel && (
            <Link
              href={nextHref}
              className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 text-sm font-medium hover:bg-card transition-colors"
              style={{ borderColor: `${accent}55` }}
            >
              {nextLabel} <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {/* Dos columnas: izquierda = grupo (dominante), derecha = lámina del dueño */}
        <div className="grid grid-cols-[1fr_auto] gap-4 sm:gap-8 items-center">
          <div className="min-w-0 space-y-3 sm:space-y-4">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              {badge}
            </span>

            <div
              className="font-display font-bold leading-[0.85] tracking-tighter"
              style={{
                color: accent,
                fontSize: "clamp(5rem, 22vw, 14rem)",
              }}
            >
              {letter}
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

          <CollectorCardLightbox
            cardSrc={cardSrc}
            initials={initials}
            username={ownerProps.username}
            displayName={ownerProps.displayName}
            accent={accent}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className="font-display text-2xl sm:text-3xl font-bold tabular shrink-0"
              style={{ color: accent }}
            >
              {percent}%
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-background/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: accent }}
              />
            </div>
            <span className="font-mono tabular text-sm text-muted-foreground shrink-0">
              {owned}/{total}
            </span>
          </div>
          {context && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">
              {context}
            </p>
          )}
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
