"use client";

import { cn } from "@/lib/utils";

type Variant = "owned" | "missing" | "duplicate";

export function CodeChip({
  code,
  accent,
  variant,
  quantity,
  shiny,
}: {
  code: string;
  /** Color del país/sección para la banda lateral */
  accent: string;
  variant: Variant;
  /** Número de repetidos, solo para variant='duplicate' */
  quantity?: number;
  shiny?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center font-mono text-xs leading-none rounded-md border pl-2 pr-2 h-7 select-text",
        variant === "owned" &&
          "bg-card border-[color-mix(in_oklab,var(--accent-section,var(--panini-blue))_40%,transparent)] text-foreground",
        variant === "duplicate" &&
          "bg-[color-mix(in_oklab,var(--card),var(--gold)_15%)] border-[color-mix(in_oklab,var(--gold)_55%,transparent)] text-foreground font-semibold",
        variant === "missing" &&
          "bg-transparent border-dashed border-[color-mix(in_oklab,var(--muted-foreground)_30%,transparent)] text-muted-foreground italic",
      )}
      style={
        {
          "--accent-section": accent,
        } as React.CSSProperties
      }
    >
      {/* Banda lateral con color del país */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
        style={{ backgroundColor: accent, opacity: variant === "missing" ? 0.4 : 0.9 }}
      />
      <span className="ml-1.5 tabular">{code}</span>
      {shiny && (
        <span
          className="ml-1 text-[10px]"
          style={{ color: "var(--gold)" }}
          aria-label="brillante"
        >
          ★
        </span>
      )}
      {variant === "duplicate" && quantity && quantity > 1 && (
        <span className="ml-1 text-[10px] text-[var(--gold)] font-bold">
          ×{quantity}
        </span>
      )}
    </span>
  );
}
