"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Diálogo de confirmación reusable — reemplaza `window.confirm()` para mantener
 * la línea visual de Panini. Soporta variante `destructive` para acciones
 * peligrosas (botón rojo) y `default` para confirmaciones neutras.
 *
 * Uso típico:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     open={open} onOpenChange={setOpen}
 *     title="¿Borrar el cromo?"
 *     description="No se puede deshacer."
 *     confirmLabel="Borrar"
 *     variant="destructive"
 *     onConfirm={handleDelete}
 *   />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  pending = false,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  pending?: boolean;
  /** Icono opcional en el header. Default: AlertTriangle para destructive. */
  icon?: React.ReactNode;
}) {
  async function handleConfirm() {
    await onConfirm();
    if (!pending) onOpenChange(false);
  }

  const isDestructive = variant === "destructive";
  const headerIcon =
    icon ??
    (isDestructive ? (
      <AlertTriangle className="size-5" strokeWidth={2.2} />
    ) : null);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "duration-200",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[min(420px,94vw)] max-h-[90vh] flex flex-col",
            "bg-card border rounded-2xl shadow-2xl overflow-hidden outline-none",
            "duration-200",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="px-6 pt-6 pb-2">
            {headerIcon && (
              <div
                className={cn(
                  "size-12 rounded-full grid place-items-center mb-4",
                  isDestructive
                    ? "bg-[var(--panini-red)]/10 text-[var(--panini-red)]"
                    : "bg-[var(--panini-blue)]/10 text-[var(--panini-blue)]",
                )}
              >
                {headerIcon}
              </div>
            )}
            <DialogPrimitive.Title className="font-display text-lg font-semibold tracking-tight">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>

          <div className="px-6 pb-6 pt-4 flex gap-2 justify-end">
            <DialogPrimitive.Close
              disabled={pending}
              className="inline-flex items-center justify-center rounded-md border bg-card px-4 h-10 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </DialogPrimitive.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-4 h-10 text-sm font-medium transition-colors disabled:opacity-50",
                isDestructive
                  ? "bg-[var(--panini-red)] text-white hover:opacity-90"
                  : "bg-foreground text-background hover:opacity-90",
              )}
            >
              {pending ? "…" : confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
