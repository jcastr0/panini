import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

/**
 * Tile compacto SSR-only para mostrar el cromo de OTRA persona.
 * Sin botones +/-, sin acciones. Indica owned / repetida / falta visualmente.
 */
export function StickerTileReadOnly({
  code,
  number,
  name,
  team,
  type,
  quantity,
  accent = "var(--panini-blue)",
}: {
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  quantity: number;
  accent?: string;
}) {
  // Códigos puramente numéricos (apertura/historia "1".."19") se muestran
  // con prefijo "FWC" en display para alinearlos con MEX1, BIH3...
  const label = code
    ? /^\d+$/.test(code)
      ? `FWC${code}`
      : code
    : `#${String(number).padStart(3, "0")}`;
  const displayName = team ?? name;
  const owned = quantity >= 1;
  const dup = quantity > 1;
  const shiny = type === "shiny" || type === "legend";

  return (
    <div
      className={cn(
        "relative rounded-lg border p-2.5 transition-opacity",
        owned ? "bg-card" : "bg-muted/30",
      )}
      style={{
        borderColor: owned ? `${accent}55` : undefined,
        opacity: owned ? 1 : 0.55,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-mono font-black tabular tracking-tight text-sm leading-none"
          style={{ color: owned ? accent : "var(--muted-foreground)" }}
        >
          {label}
        </span>
        {shiny && (
          <Sparkles
            className="size-3.5 text-[var(--gold)]"
            aria-label="Brillante"
          />
        )}
      </div>

      <div
        className="rounded h-12 grid place-items-center px-1 mb-1.5"
        style={{
          backgroundColor: owned
            ? `color-mix(in oklab, var(--card), ${accent} 12%)`
            : "var(--muted)",
        }}
      >
        <span
          className={cn(
            "font-display font-semibold text-xs leading-tight text-center",
            !owned && "italic text-muted-foreground",
          )}
        >
          {displayName}
        </span>
      </div>

      {team && team !== name && (
        <div
          className={cn(
            "text-[10px] leading-tight truncate mb-1",
            owned ? "text-foreground/80" : "text-muted-foreground/70",
          )}
        >
          {name}
        </div>
      )}

      <div className="flex items-center justify-between">
        {owned ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              color: accent,
              backgroundColor: `color-mix(in oklab, transparent, ${accent} 14%)`,
            }}
          >
            <Check className="size-3" /> La tiene
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground italic">
            Le falta
          </span>
        )}
        {dup && (
          <span
            className="font-mono text-[10px] font-bold rounded px-1.5 py-0.5"
            style={{
              color: "var(--gold)",
              backgroundColor: "color-mix(in oklab, transparent, var(--gold) 18%)",
            }}
          >
            ×{quantity}
          </span>
        )}
      </div>
    </div>
  );
}
