"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setStickerQuantity } from "../actions";

type Props = {
  id: string;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  initialQuantity: number;
};

export function StickerCard({
  id,
  number,
  name,
  team,
  type,
  initialQuantity,
}: Props) {
  const [qty, setQty] = useState(initialQuantity);
  const [pending, startTransition] = useTransition();

  function update(next: number) {
    const clamped = Math.max(0, Math.min(99, next));
    if (clamped === qty) return;
    const prev = qty;
    setQty(clamped);
    startTransition(async () => {
      const res = await setStickerQuantity(id, clamped);
      if ("error" in res && res.error) {
        setQty(prev);
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
        pending && "opacity-70",
      )}
    >
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>#{String(number).padStart(3, "0")}</span>
          {shiny && (
            <Sparkles className="size-3 text-[var(--gold)]" aria-label="shiny" />
          )}
        </div>

        <div
          className={cn(
            "h-14 rounded grid place-items-center text-center px-1",
            owned
              ? "bg-[color-mix(in_oklab,var(--card),var(--pitch)_8%)]"
              : "bg-[color-mix(in_oklab,var(--muted),transparent_40%)]",
          )}
        >
          <span
            className={cn(
              "font-display font-semibold leading-tight text-sm",
              !owned && "text-muted-foreground/60",
            )}
          >
            {team ?? name}
          </span>
        </div>

        {team && team !== name && (
          <div className="text-[11px] leading-tight text-muted-foreground/90 truncate">
            {name}
          </div>
        )}

        <div className="flex items-center justify-between mt-0.5">
          <button
            type="button"
            onClick={() => update(qty - 1)}
            disabled={qty === 0 || pending}
            aria-label="Disminuir"
            className="size-6 rounded-md border border-border/70 grid place-items-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="size-3" />
          </button>
          <span
            className={cn(
              "font-mono tabular text-sm min-w-7 text-center",
              dup && "text-[var(--gold)] font-semibold",
              !owned && "text-muted-foreground",
            )}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => update(qty + 1)}
            disabled={pending}
            aria-label="Aumentar"
            className="size-6 rounded-md border border-border/70 grid place-items-center hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
