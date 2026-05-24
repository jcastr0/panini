import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { AlbumOwnerTag } from "./album-owner-tag";

export function SectionHero({
  accent,
  tint,
  badge,
  title,
  subtitle,
  flags,
  owned,
  total,
  ownerProps,
}: {
  accent: string;
  tint: string;
  badge: string;
  title: React.ReactNode;
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

  return (
    <section
      className="relative -mx-6 px-6 py-8 sm:py-10 rounded-b-3xl border-b"
      style={{ backgroundColor: tint }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <Link
            href="/album"
            className="inline-flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border px-4 h-10 text-sm font-medium hover:bg-card transition-colors"
          >
            <ArrowLeft className="size-4" /> Mi álbum
          </Link>
          <AlbumOwnerTag {...ownerProps} size="sm" />
        </div>

        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {badge}
            </span>
            <div
              className="font-display font-bold leading-[0.9] tracking-tighter"
              style={{ color: accent }}
            >
              {title}
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base mt-2">
                {subtitle}
              </p>
            )}
            {flags && flags.length > 0 && (
              <div className="flex gap-2 mt-3 text-2xl leading-none">
                {flags.map((t) => (
                  <span key={t.name} title={t.name} aria-hidden>
                    {t.flag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-[200px] space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className="font-display text-3xl font-bold tabular"
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
