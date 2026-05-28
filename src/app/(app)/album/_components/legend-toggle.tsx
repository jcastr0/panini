"use client";

import { useState, useTransition } from "react";
import { Shirt, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setDisplayVariant } from "../actions";

export function LegendToggle({
  slotId,
  legendCode,
  initialVariant,
}: {
  /** Sticker id of the NORMAL player slot (not the legend) */
  slotId: string;
  /** Display code of the linked legend (used in aria-label/title) */
  legendCode: string;
  /** Current persisted variant; null = default (normal) */
  initialVariant: "normal" | "legend" | null;
}) {
  const [variant, setVariant] = useState<"normal" | "legend">(
    initialVariant === "legend" ? "legend" : "normal",
  );
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = variant === "normal" ? "legend" : "normal";
    const prev = variant;
    setVariant(next);
    startTransition(async () => {
      const res = await setDisplayVariant(slotId, next);
      if ("error" in res && res.error) {
        setVariant(prev);
        toast.error(res.error);
      } else if (next === "legend") {
        toast.success(`Legend pegada · ${legendCode}`);
      } else {
        toast(`Volviste a la lámina normal`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={
        variant === "normal"
          ? `Pegar Legend ${legendCode} sobre este slot`
          : `Despegar Legend y volver al normal`
      }
      className={cn(
        "absolute top-1 right-1 z-20 size-7 rounded-full grid place-items-center transition-all",
        "border shadow-md",
        variant === "legend"
          ? "bg-[var(--gold)] border-[var(--gold)]/70 text-foreground"
          : "bg-card/90 border-[var(--gold)]/40 text-muted-foreground hover:bg-[var(--gold)]/15",
        pending && "opacity-60 cursor-wait",
      )}
      title={variant === "legend" ? `Mostrando Legend (${legendCode})` : "Mostrando Normal"}
    >
      {variant === "legend" ? (
        <Sparkles className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Shirt className="size-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
