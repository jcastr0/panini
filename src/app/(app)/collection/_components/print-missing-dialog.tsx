"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Eye, EyeOff, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stickerImagePath } from "@/lib/sticker-image";
import type { CollectionSticker } from "./collection-tabs";

const STORAGE_PREFIX = "paninijd:print-omit:";

/**
 * Dialog para imprimir la lista de faltantes con imagen.
 *
 * - Permite omitir cromos individuales (estado en localStorage por sticker_id).
 *   Útil para no revelar cromos "valiosos" al imprimir y mostrar la lista a
 *   otros coleccionistas (ej. esconder a Messi para que no pidan 30×1).
 * - Layout optimizado para print: grid denso, imagen + código + nombre +
 *   un cuadradito para tachar a mano cuando se intercambie físicamente.
 * - El usuario decide al final si imprime; el cuadro previo es el preview.
 */
export function PrintMissingDialog({
  missing,
  open,
  onOpenChange,
}: {
  missing: CollectionSticker[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [omitted, setOmitted] = React.useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const set = new Set<string>();
    try {
      for (const s of missing) {
        if (localStorage.getItem(STORAGE_PREFIX + s.id) === "1") set.add(s.id);
      }
    } catch {
      /* ignore */
    }
    setOmitted(set);
    setHydrated(true);
  }, [open, missing]);

  function toggleOmit(id: string) {
    setOmitted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        try {
          localStorage.removeItem(STORAGE_PREFIX + id);
        } catch {
          /* ignore */
        }
      } else {
        next.add(id);
        try {
          localStorage.setItem(STORAGE_PREFIX + id, "1");
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
        localStorage.removeItem(STORAGE_PREFIX + s.id);
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
            localStorage.setItem(STORAGE_PREFIX + s.id, "1");
          } catch {
            /* ignore */
          }
        }
      }
      return next;
    });
  }

  const legendsCount = missing.filter((s) => s.type === "legend").length;
  const allLegendsOmitted =
    legendsCount > 0 &&
    missing.filter((s) => s.type === "legend").every((s) => omitted.has(s.id));

  const visible = missing.filter((s) => !omitted.has(s.id));

  function handlePrint() {
    document.body.classList.add("printing-missing");
    window.print();
    // Limpiar tras un tick — algunos navegadores disparan onafterprint async.
    setTimeout(() => document.body.classList.remove("printing-missing"), 500);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 print:hidden" />
        <Dialog.Popup className="print-target fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl max-h-[92vh] rounded-xl border bg-card shadow-2xl flex flex-col">
          {/* Header (oculto en print) */}
          <header className="flex items-center justify-between gap-3 px-6 py-4 border-b print:hidden">
            <div>
              <Dialog.Title className="font-display text-xl font-semibold">
                Imprimir faltantes
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground">
                {visible.length} de {missing.length} visibles ·{" "}
                {omitted.size > 0
                  ? `${omitted.size} omitidos`
                  : "Marca los que quieras ocultar"}
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
              Faltantes — Mundial 2026
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
                {/* En PREVIEW mostramos todos (incluso los omitidos, en gris claro);
                    en PRINT, solo los visibles. */}
                {missing.map((s) => {
                  const isOmit = omitted.has(s.id);
                  return (
                    <PrintItem
                      key={s.id}
                      sticker={s}
                      omitted={isOmit}
                      hydrated={hydrated}
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
  onToggle,
}: {
  sticker: CollectionSticker;
  omitted: boolean;
  hydrated: boolean;
  onToggle: () => void;
}) {
  const img = stickerImagePath(sticker.code);
  const label = sticker.team ?? sticker.name;
  const code = sticker.code ?? `#${sticker.number}`;

  return (
    <li
      className={
        omitted
          ? "relative border-2 border-dashed rounded-lg overflow-hidden bg-muted/40 opacity-40 print:hidden"
          : "relative border rounded-lg overflow-hidden bg-card print:border-black/30 print:rounded-md print:break-inside-avoid"
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

      {/* Code + nombre (compacto, sin cuadradito — se tacha con marker) */}
      <div className="px-1.5 py-1 border-t text-center print:border-black/20">
        <p className="font-mono text-[10px] font-semibold text-foreground print:text-black">
          {code}
        </p>
        <p className="text-[10px] truncate leading-tight text-muted-foreground print:text-black/80">
          {label}
        </p>
      </div>
    </li>
  );
}
