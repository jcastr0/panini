"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Eye, EyeOff, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stickerImagePath } from "@/lib/sticker-image";
import type { CollectionSticker } from "./collection-tabs";

export type PrintVariant = "missing" | "duplicate";

const STORAGE_PREFIX: Record<PrintVariant, string> = {
  missing: "paninijd:print-omit:",
  duplicate: "paninijd:print-omit-dupe:",
};

const COPY: Record<
  PrintVariant,
  {
    title: string;
    printHeader: string;
    emptyHint: string;
  }
> = {
  missing: {
    title: "Imprimir faltantes",
    printHeader: "Faltantes — Mundial 2026",
    emptyHint: "Marca los que quieras ocultar",
  },
  duplicate: {
    title: "Imprimir repetidos",
    printHeader: "Repetidos para intercambio — Mundial 2026",
    emptyHint: "Marca los que no quieras ofrecer (ej. los que ya prometiste)",
  },
};

/**
 * Dialog para imprimir una lista de cromos (faltantes o repetidos) con imagen.
 *
 * - Variant "missing": cromos que me faltan; útil para llevar la lista al
 *   intercambio físico. Atajo "Omitir legends" porque son extras.
 * - Variant "duplicate": cromos repetidos que tengo; útil para mostrar a
 *   otros qué puedo ofrecer. Muestra la cantidad de repetidas (×N).
 *
 * Permite omitir cromos individuales — útil para no revelar "valiosos"
 * (Messi, Mbappé) y evitar que pidan 30×1, o para no anunciar repetidas
 * que ya tienes comprometidas.
 */
export function PrintMissingDialog({
  missing,
  open,
  onOpenChange,
  variant = "missing",
}: {
  missing: CollectionSticker[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant?: PrintVariant;
}) {
  const prefix = STORAGE_PREFIX[variant];
  const copy = COPY[variant];
  const [omitted, setOmitted] = React.useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const set = new Set<string>();
    try {
      for (const s of missing) {
        if (localStorage.getItem(prefix + s.id) === "1") set.add(s.id);
      }
    } catch {
      /* ignore */
    }
    setOmitted(set);
    setHydrated(true);
  }, [open, missing, prefix]);

  function toggleOmit(id: string) {
    setOmitted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        try {
          localStorage.removeItem(prefix + id);
        } catch {
          /* ignore */
        }
      } else {
        next.add(id);
        try {
          localStorage.setItem(prefix + id, "1");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  function clearAll() {
    for (const s of missing) {
      try {
        localStorage.removeItem(prefix + s.id);
      } catch {
        /* ignore */
      }
    }
    setOmitted(new Set());
  }

  function omitAllLegends() {
    setOmitted((prev) => {
      const next = new Set(prev);
      for (const s of missing) {
        if (s.type === "legend") {
          next.add(s.id);
          try {
            localStorage.setItem(prefix + s.id, "1");
          } catch {
            /* ignore */
          }
        }
      }
      return next;
    });
  }

  // Atajo "Omitir legends" solo tiene sentido en faltantes (son extras del álbum).
  const legendsCount =
    variant === "missing"
      ? missing.filter((s) => s.type === "legend").length
      : 0;
  const allLegendsOmitted =
    legendsCount > 0 &&
    missing.filter((s) => s.type === "legend").every((s) => omitted.has(s.id));

  const visible = missing.filter((s) => !omitted.has(s.id));
  const popupRef = React.useRef<HTMLDivElement | null>(null);

  function handlePrint() {
    if (!popupRef.current) return;
    const original = popupRef.current;
    const clone = original.cloneNode(true) as HTMLElement;
    clone.className = "print-clone";
    clone.querySelectorAll(".print\\:hidden").forEach((el) => el.remove());
    clone
      .querySelectorAll<HTMLLIElement>("li[data-omitted='1']")
      .forEach((el) => el.remove());

    document.body.appendChild(clone);
    document.body.classList.add("printing-missing");

    const cleanup = () => {
      if (document.body.contains(clone)) document.body.removeChild(clone);
      document.body.classList.remove("printing-missing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => window.print(), 80);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 print:hidden" />
        <Dialog.Popup
          ref={popupRef}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl max-h-[92vh] rounded-xl border bg-card shadow-2xl flex flex-col"
        >
          {/* Header (oculto en print) */}
          <header className="flex items-center justify-between gap-3 px-6 py-4 border-b print:hidden">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">
                {copy.title}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground">
                {visible.length} de {missing.length} visibles ·{" "}
                {omitted.size > 0
                  ? `${omitted.size} omitidos`
                  : copy.emptyHint}
              </Dialog.Description>
            </div>
            <div className="flex items-center gap-2">
              {legendsCount > 0 && !allLegendsOmitted && (
                <Button variant="outline" size="sm" onClick={omitAllLegends}>
                  Omitir legends ({legendsCount})
                </Button>
              )}
              {omitted.size > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Mostrar todos
                </Button>
              )}
              <Button onClick={handlePrint} disabled={visible.length === 0}>
                <Printer className="size-4 mr-1.5" /> Imprimir
              </Button>
              <Dialog.Close
                render={
                  <button
                    aria-label="Cerrar"
                    className="size-9 rounded-full grid place-items-center hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                }
              />
            </div>
          </header>

          {/* Header de print (oculto en pantalla) */}
          <div className="hidden print:block px-6 py-4 border-b border-black/20">
            <p className="font-display text-2xl font-bold tracking-tight text-black">
              {copy.printHeader}
            </p>
            <p className="text-xs text-black/70">
              {visible.length} cromos · paninijd.lat
            </p>
          </div>

          {/* Grid — preview + impresión */}
          <div className="flex-1 overflow-y-auto p-4 print:overflow-visible print:p-3">
            {visible.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground print:hidden">
                <p>No hay cromos para imprimir.</p>
                {omitted.size > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-2 text-sm underline"
                  >
                    Mostrar todos
                  </button>
                )}
              </div>
            ) : (
              <ul className="print-grid grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {missing.map((s) => {
                  const isOmit = omitted.has(s.id);
                  return (
                    <PrintItem
                      key={s.id}
                      sticker={s}
                      omitted={isOmit}
                      hydrated={hydrated}
                      variant={variant}
                      onToggle={() => toggleOmit(s.id)}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PrintItem({
  sticker,
  omitted,
  hydrated,
  variant,
  onToggle,
}: {
  sticker: CollectionSticker;
  omitted: boolean;
  hydrated: boolean;
  variant: PrintVariant;
  onToggle: () => void;
}) {
  const img = stickerImagePath(sticker.code);
  const label = sticker.team ?? sticker.name;
  const code = sticker.code ?? `#${sticker.number}`;
  // Para repetidos: mostrar cantidad disponible (qty - 1 = repetidas, descontando la pegada).
  const dupesAvailable =
    variant === "duplicate" ? Math.max(0, sticker.qty - 1) : 0;

  return (
    <li
      data-omitted={omitted ? "1" : undefined}
      className={
        omitted
          ? "relative border-2 border-dashed rounded-lg overflow-hidden bg-muted/40 opacity-40"
          : "relative border rounded-lg overflow-hidden bg-card"
      }
    >
      {/* Toggle omitir (solo pantalla) */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={omitted ? "Mostrar en impresión" : "Omitir de la impresión"}
        title={omitted ? "Mostrar en impresión" : "Omitir de la impresión"}
        className="absolute top-1 right-1 z-10 size-7 rounded-full grid place-items-center bg-card/90 border shadow-sm hover:bg-card print:hidden"
      >
        {hydrated && omitted ? (
          <EyeOff className="size-3.5 text-muted-foreground" />
        ) : (
          <Eye className="size-3.5 text-foreground/70" />
        )}
      </button>

      {/* Badge ×N para repetidos */}
      {variant === "duplicate" && dupesAvailable >= 1 && (
        <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 rounded-full bg-[var(--gold)] text-foreground text-[10px] font-bold tabular shadow-sm">
          ×{dupesAvailable}
        </span>
      )}

      {/* Imagen */}
      <div className="relative aspect-[3/4] bg-muted print:bg-white">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={label}
            loading="lazy"
            className="absolute inset-0 size-full object-cover print:object-contain"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-mono text-[10px] text-muted-foreground">
              {code}
            </span>
          </div>
        )}
      </div>

      {/* Code + nombre (compacto) */}
      <div className="px-1.5 py-1 border-t text-center print:border-black/20">
        <p className="font-mono text-[10px] font-semibold text-foreground print:text-black">
          {code}
          {variant === "duplicate" && dupesAvailable >= 1 && (
            <span className="ml-1 text-[var(--gold)] print:text-black">
              ×{dupesAvailable}
            </span>
          )}
        </p>
        <p className="text-[10px] truncate leading-tight text-muted-foreground print:text-black/80">
          {label}
        </p>
      </div>
    </li>
  );
}
