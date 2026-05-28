"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Minus, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { StickerLightbox } from "./sticker-lightbox";
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
  /**
   * Cuando el cromo es parte del trofeo armado, indica qué mitad ocupa.
   * "top": controles arriba, imagen abajo, sin redondeo inferior.
   * "bottom": imagen arriba, controles abajo, sin redondeo superior.
   * Sin valor: render normal.
   */
  trofeoHalf?: "top" | "bottom";
  /**
   * Modo lectura — la vista del álbum de otro usuario. Oculta los
   * controles +/- y muestra un badge "La tiene · ×N" / "Le falta"
   * en su lugar. El zoom (lightbox) sigue activo.
   */
  readOnly?: boolean;
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
  trofeoHalf,
  readOnly = false,
}: Props) {
  const [qty, setQty] = useState(initialQuantity);
  const [pending, startTransition] = useTransition();
  const [pop, setPop] = useState(false);
  const [askUnpaste, setAskUnpaste] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
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

  // Imagen real del cromo cuando está pegado (no spoiler antes).
  // - Equipos (MEX1, BIH3, ESP10...): /laminas/<CODE>/<code><n>.jpg
  // - Coca-Cola (CC1..CC14):          /cocacola/cc<n>.jpg
  // Cuando una imagen no existe en disco, el <img> dispara onError y
  // volvemos al placeholder con el nombre.
  const stickerImage = stickerImageFromCode(code, owned);

  const isTrofeoTop = trofeoHalf === "top";
  const isTrofeoBottom = trofeoHalf === "bottom";

  const header = (
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
  );

  const imageBlock = (
    <div
      className={cn(
        "grid place-items-center text-center px-1 overflow-hidden",
        // Sin redondeo cuando es parte del trofeo en el borde que se une
        isTrofeoTop
          ? "rounded-t rounded-b-none"
          : isTrofeoBottom
            ? "rounded-b rounded-t-none"
            : "rounded",
        horizontal
          ? "h-10 sm:h-32"
          : stickerImage && !imgFailed
            ? "h-32"
            : "h-14",
        owned
          ? "bg-[color-mix(in_oklab,var(--card),var(--accent-section,var(--pitch))_22%)] ring-1 ring-[color-mix(in_oklab,var(--accent-section,var(--pitch))_30%,transparent)]"
          : "bg-[color-mix(in_oklab,var(--muted-foreground),transparent_85%)]",
      )}
    >
      {stickerImage && !imgFailed ? (
        <StickerLightbox
          src={stickerImage}
          alt={displayName}
          code={code}
          number={number}
          name={name}
          team={team}
          shiny={shiny}
          horizontal={horizontal}
        >
          <button
            type="button"
            aria-label={`Ver ${displayName} en grande`}
            className="block size-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1 rounded cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stickerImage}
              alt={displayName}
              draggable={false}
              className="size-full object-cover pointer-events-none"
              onError={() => setImgFailed(true)}
            />
          </button>
        </StickerLightbox>
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
  );

  const nameBlock =
    team && team !== name ? (
      <div
        className={cn(
          "text-[11px] leading-tight truncate",
          owned ? "text-foreground/80 font-medium" : "text-muted-foreground/60",
        )}
      >
        {name}
      </div>
    ) : null;

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
          // Modo trofeo: quitar redondeo en el borde que se une al otro cromo
          isTrofeoTop && "rounded-b-none pb-0",
          isTrofeoBottom && "rounded-t-none pt-0",
        )}
      >
        <div className="relative z-10 flex flex-col gap-1.5">
          {(() => {
            const readOnlyBadge = (
              <div className="flex items-center justify-between mt-1 gap-2 min-h-10">
                {owned ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                      "text-[var(--accent-section,var(--pitch))]",
                      "bg-[color-mix(in_oklab,transparent,var(--accent-section,var(--pitch))_14%)]",
                    )}
                  >
                    <Check className="size-3" strokeWidth={2.5} /> La tiene
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    Le falta
                  </span>
                )}
                {dup && (
                  <span
                    className={cn(
                      "font-mono tabular text-xs font-bold rounded px-2 py-0.5",
                      "text-[var(--gold)] bg-[color-mix(in_oklab,transparent,var(--gold)_18%)]",
                    )}
                  >
                    ×{qty}
                  </span>
                )}
              </div>
            );

            const controls = readOnly ? readOnlyBadge : (
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
            );

            if (isTrofeoTop) {
              // Controles arriba, imagen abajo (pegada al borde inferior).
              return (
                <>
                  {header}
                  {controls}
                  {imageBlock}
                </>
              );
            }
            if (isTrofeoBottom) {
              // Imagen arriba (pegada al borde superior), controles abajo.
              return (
                <>
                  {imageBlock}
                  {header}
                  {nameBlock}
                  {controls}
                </>
              );
            }
            return (
              <>
                {header}
                {imageBlock}
                {nameBlock}
                {controls}
              </>
            );
          })()}
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

/**
 * Devuelve la URL de la lámina real para un código de cromo, o null si
 * el cromo no está pegado (no spoilear).
 *
 *  - Equipos (3 letras + número): MEX1 → /laminas/MEX/mex1.jpg
 *  - Coca-Cola (CC + número):     CC1  → /cocacola/cc1.jpg
 *
 * Si la imagen no existe en disco, el <img> dispara onError y caemos
 * al placeholder con el nombre. Para agregar más láminas, basta con
 * dropear los archivos en /public/laminas/<CODE>/ — no hay que tocar
 * este componente.
 */
function stickerImageFromCode(
  code: string | null,
  owned: boolean,
): string | null {
  if (!owned || !code) return null;
  const teamMatch = code.match(/^([A-Z]{3})(\d+)$/);
  if (teamMatch) {
    const [, prefix, n] = teamMatch;
    return `/laminas/${prefix}/${prefix.toLowerCase()}${n}.jpg`;
  }
  const ccMatch = code.match(/^CC(\d{1,2})$/);
  if (ccMatch) {
    return `/cocacola/cc${ccMatch[1]}.jpg`;
  }
  // Códigos numéricos puros (apertura/historia): "00", "1"..."19".
  // Apertura tiene fwc1..fwc8 con escudo del torneo. Historia 9..19 usaría
  // el mismo path /laminas/FWC/fwc<N>.jpg cuando se agreguen.
  const numMatch = code.match(/^(\d+)$/);
  if (numMatch) {
    return `/laminas/FWC/fwc${numMatch[1]}.jpg`;
  }
  return null;
}
