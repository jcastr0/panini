"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setStickerQuantity } from "../actions";

type Props = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  initialQuantity: number;
  /** Variante ancha (col-span-2). Usado para Team Photo en hoja 2 */
  horizontal?: boolean;
};

export function StickerCard({
  id,
  code,
  number,
  name,
  team,
  type,
  initialQuantity,
  horizontal = false,
}: Props) {
  const [qty, setQty] = useState(initialQuantity);
  const [pending, startTransition] = useTransition();
  const [pop, setPop] = useState(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  function update(next: number) {
    const clamped = Math.max(0, Math.min(99, next));
    if (clamped === qty) return;
    const prev = qty;
    const becameOwned = prev === 0 && clamped >= 1;
    setQty(clamped);
    if (becameOwned) {
      setPop(true);
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
      popTimerRef.current = setTimeout(() => setPop(false), 450);
    }
    startTransition(async () => {
      const res = await setStickerQuantity(id, clamped);
      if ("error" in res && res.error) {
        setQty(prev);
        setPop(false);
        toast.error(res.error);
      }
    });
  }

  const owned = qty >= 1;
  const dup = qty > 1;
  const shiny = type === "shiny" || type === "legend";

  return (
    <div
      className={cn(
        "sticker-slot relative p-2.5 transition-transform duration-150",
        owned ? "sticker-slot--owned" : "sticker-slot--empty",
        dup && "sticker-slot--duplicate",
        shiny && owned && "sticker-slot--shiny",
        pop && "pop-on-mark",
        pending && "opacity-70",
      )}
    >
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="font-semibold text-foreground/80">
            {code ?? `#${String(number).padStart(3, "0")}`}
          </span>
          {shiny && (
            <Sparkles
              className="size-3.5 text-[var(--gold)]"
              aria-label="brillante"
            />
          )}
        </div>

        <div
          className={cn(
            "rounded grid place-items-center text-center px-1",
            horizontal ? "h-10" : "h-14",
            owned
              ? "bg-[color-mix(in_oklab,var(--card),var(--accent-section,var(--pitch))_10%)]"
              : "bg-[color-mix(in_oklab,var(--muted),transparent_40%)]",
          )}
        >
          <span
            className={cn(
              "font-display font-semibold leading-tight",
              horizontal ? "text-base" : "text-sm",
              !owned && "text-muted-foreground/60",
            )}
          >
            {team ?? name}
          </span>
        </div>

        {team && team !== name && (
          <div className="text-[11px] leading-tight text-muted-foreground truncate">
            {name}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 gap-2">
          <button
            type="button"
            onClick={() => update(qty - 1)}
            disabled={qty === 0 || pending}
            aria-label="Quitar uno"
            className="size-10 rounded-md border border-border/70 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
          >
            <Minus className="size-4" />
          </button>
          <span
            className={cn(
              "font-mono tabular text-base min-w-[2ch] text-center font-semibold",
              dup && "text-[var(--gold)]",
              !owned && "text-muted-foreground font-normal",
            )}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => update(qty + 1)}
            disabled={pending}
            aria-label="Agregar uno"
            className="size-10 rounded-md border border-border/70 grid place-items-center hover:bg-muted disabled:opacity-30 transition-colors active:scale-95"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
