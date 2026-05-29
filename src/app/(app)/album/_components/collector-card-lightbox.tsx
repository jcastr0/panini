"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Vista ampliada de la lámina MyPanini (collector card) del dueño del álbum.
 * Reutiliza el patrón visual del StickerLightbox: backdrop oscuro, frame
 * con marco dorado, tilt 3D al mover el mouse, close button flotante.
 *
 * El trigger es un <button> con el thumb dentro — clickeable en mobile/desktop.
 */
export function CollectorCardLightbox({
  cardSrc,
  initials,
  username,
  displayName,
  accent,
}: {
  cardSrc: string | null;
  initials: string;
  username: string;
  displayName: string | null;
  accent: string;
}) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [shine, setShine] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      setTilt({ x: (px - 0.5) * 14, y: (py - 0.5) * -14 });
      setShine({ x: px * 100, y: py * 100 });
    },
    [],
  );

  const resetTilt = React.useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  }, []);

  const name = displayName || (username ? `@${username}` : "Coleccionista");

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={`Ver lámina de ${name}`}
            className="group flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div
              className="relative w-20 sm:w-24 lg:w-28 aspect-[3/4] rounded-lg overflow-hidden ring-2 shadow-lg transition-transform group-hover:-translate-y-0.5 group-active:scale-95"
              style={{
                borderColor: accent,
                boxShadow: `0 8px 20px -8px ${accent}55`,
              }}
            >
              {cardSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cardSrc}
                  alt={`Lámina de @${username}`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-card grid place-items-center text-xl font-bold text-muted-foreground">
                  {initials || "?"}
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight max-w-[6rem] sm:max-w-[7rem]">
              Álbum de
              <br />
              <span className="font-semibold text-foreground">
                @{username || "tu"}
              </span>
            </p>
          </button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50",
            "bg-[oklch(0.16_0.04_145/_0.78)] backdrop-blur-xl",
            "before:absolute before:inset-0 before:pointer-events-none",
            "before:bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]",
            "duration-300",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-auto outline-none max-w-[min(420px,92vw)]",
            "duration-300",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-90",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Lámina de {name}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Lámina del coleccionista, vista ampliada.
          </DialogPrimitive.Description>

          <div className="relative flex flex-col items-center gap-4 sm:gap-5">
            <div
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-1.5 rounded-full",
                "bg-white/[0.08] backdrop-blur-md border border-white/[0.12]",
                "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]",
              )}
            >
              <span className="font-mono font-black tracking-[0.22em] text-[11px] text-white/90">
                MYPANINI
              </span>
            </div>

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              className="relative"
              style={{ perspective: "1400px" }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-[18px] p-[6px] sm:p-[8px]",
                  "bg-gradient-to-br from-[oklch(0.97_0.012_85)] via-[oklch(0.93_0.018_80)] to-[oklch(0.87_0.025_70)]",
                  "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.55),0_12px_28px_-12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(0,0,0,0.05)]",
                  "transition-transform duration-150 ease-out will-change-transform",
                )}
                style={{
                  transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {cardSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cardSrc}
                    alt={`Lámina de ${name}`}
                    draggable={false}
                    className="relative block rounded-[12px] select-none bg-white w-full h-auto max-h-[78vh] object-contain"
                  />
                ) : (
                  <div className="relative block rounded-[12px] bg-white aspect-[3/4] w-[min(360px,72vw)] grid place-items-center">
                    <span className="font-display text-6xl font-bold text-muted-foreground">
                      {initials || "?"}
                    </span>
                  </div>
                )}

                <div
                  aria-hidden
                  className="absolute inset-[6px] sm:inset-[8px] rounded-[12px] pointer-events-none mix-blend-overlay opacity-60"
                  style={{
                    background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 45%)`,
                  }}
                />

                <div
                  aria-hidden
                  className="absolute inset-[6px] sm:inset-[8px] rounded-[12px] pointer-events-none ring-1 ring-inset ring-black/[0.08]"
                />
              </div>

              <div
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-full -translate-x-1/2 mt-2",
                  "w-[78%] h-10 blur-md opacity-70",
                  "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,transparent_72%)]",
                )}
              />
            </div>

            <div className="text-center px-4 max-w-[90vw] mt-1">
              <p className="font-display text-base sm:text-lg font-semibold tracking-tight text-white/95 leading-tight">
                {name}
              </p>
              {username && (
                <p className="mt-1 text-xs sm:text-sm text-white/55 font-mono">
                  @{username}
                </p>
              )}
            </div>

            <DialogPrimitive.Close
              aria-label="Cerrar"
              className={cn(
                "absolute -top-3 -right-3 sm:-top-4 sm:-right-5",
                "size-10 rounded-full grid place-items-center",
                "bg-white/10 backdrop-blur-md border border-white/15",
                "text-white/85 hover:text-white hover:bg-white/[0.16] active:scale-95",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                "shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]",
              )}
            >
              <X className="size-[18px]" strokeWidth={2.4} />
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
