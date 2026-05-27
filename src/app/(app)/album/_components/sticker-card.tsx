"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [askUnpaste, setAskUnpaste] = useState(false);
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current);
    };
  }, []);

  // Códigos puramente numéricos (apertura/historia: "00", "1", ..., "19")
  // se muestran con prefijo "FWC" para que sean buscables como las selecciones
  // (MEX1, FWC1...). Códigos con letras (MEX1, CC3) se muestran tal cual.
  const label = code
    ? /^\d+$/.test(code)
      ? `FWC${code}`
      : code
    : `#${String(number).padStart(3, "0")}`;
  const displayName = team ?? name;

  function commit(next: number) {
    const clamped = Math.max(0, Math.min(99, next));
    if (clamped === qty) return;
    const prev = qty;
    const becameOwned = prev === 0 && clamped >= 1;
    const becameDup = prev === 1 && clamped === 2;
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
        return;
      }
      // Feedback positivo solo en transiciones clave
      if (becameOwned) {
        toast.success(`¡${label} pegada!`, {
          description: displayName,
        });
      } else if (becameDup) {
        toast(`Repetida agregada · disponible para intercambio`, {
          description: `${label} · ${displayName}`,
        });
      }
    });
  }

  function handleDecrement() {
    // 1 → 0 requiere confirmación: el usuario está "despegando" del álbum
    if (qty === 1) {
      setAskUnpaste(true);
      return;
    }
    commit(qty - 1);
  }

  function confirmUnpaste() {
    setAskUnpaste(false);
    commit(0);
  }

  const owned = qty >= 1;
  const dup = qty > 1;
  const shiny = type === "shiny" || type === "legend";
  const decrementIsUnpaste = qty === 1;

  // Para cromos Coca-Cola tenemos la imagen real (cc1.jpg..cc14.jpg) en
  // /public/cocacola/. Sólo se muestra cuando está pegado — antes de pegarlo
  // mantenemos el placeholder con el nombre (no spoiler).
  const ccMatch = code?.match(/^CC(\d{1,2})$/);
  const ccImage = ccMatch && owned ? `/cocacola/cc${ccMatch[1]}.jpg` : null;

  return (
    <>
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
          <div className="flex items-center justify-between gap-1">
            <span
              className="font-mono font-black tabular tracking-tight text-sm sm:text-base leading-none text-[var(--accent-section,var(--pitch))]"
              aria-label={`Código ${label}`}
            >
              {label}
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
              "rounded grid place-items-center text-center px-1 overflow-hidden",
              horizontal ? "h-10" : ccImage ? "h-32" : "h-14",
              owned
                ? "bg-[color-mix(in_oklab,var(--card),var(--accent-section,var(--pitch))_22%)] ring-1 ring-[color-mix(in_oklab,var(--accent-section,var(--pitch))_30%,transparent)]"
                : "bg-[color-mix(in_oklab,var(--muted-foreground),transparent_85%)]",
            )}
          >
            {ccImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ccImage}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  "font-display font-semibold leading-tight",
                  horizontal ? "text-base" : "text-sm",
                  !owned && "text-muted-foreground/50 italic",
                )}
              >
                {displayName}
              </span>
            )}
          </div>

          {team && team !== name && (
            <div
              className={cn(
                "text-[11px] leading-tight truncate",
                owned
                  ? "text-foreground/80 font-medium"
                  : "text-muted-foreground/60",
              )}
            >
              {name}
            </div>
          )}

          <div className="flex items-center justify-between mt-1 gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={qty === 0 || pending}
              aria-label={decrementIsUnpaste ? "Despegar" : "Quitar uno"}
              className={cn(
                "size-10 rounded-md border grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95",
                decrementIsUnpaste
                  ? "border-[var(--panini-red)]/40 text-[var(--panini-red)] hover:bg-[var(--panini-red)]/10"
                  : "border-border/70 hover:bg-muted",
              )}
            >
              {decrementIsUnpaste ? (
                <Trash2 className="size-4" />
              ) : (
                <Minus className="size-4" />
              )}
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
              onClick={() => commit(qty + 1)}
              disabled={pending}
              aria-label="Agregar uno"
              className="size-10 rounded-md border border-border/70 grid place-items-center hover:bg-muted disabled:opacity-30 transition-colors active:scale-95"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={askUnpaste} onOpenChange={setAskUnpaste}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Despegar {label}?</DialogTitle>
            <DialogDescription>
              Vas a quitar <strong>{displayName}</strong> de tu álbum. Esta
              acción se puede deshacer volviendo a marcarla con el botón{" "}
              <span className="font-mono">+</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setAskUnpaste(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmUnpaste}
              disabled={pending}
              className="bg-[var(--panini-red)] text-white hover:bg-[var(--panini-red)]/90"
            >
              <Trash2 className="size-4 mr-1" /> Sí, despegar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
