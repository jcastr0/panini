"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Coffee, Copy, ExternalLink, Heart, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAYPAL_URL = "https://paypal.me/jhonatancastropolo";
const BREB_KEY = "@jhonatan9365";

/**
 * Botón discreto para apoyar el proyecto. Abre un dialog con:
 *   - PayPal (paypal.me link directo)
 *   - Bre-b (Bancolombia) con QR + llave copiable
 */
export function SupportButton() {
  const [copied, setCopied] = React.useState(false);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(BREB_KEY);
      setCopied(true);
      toast.success("Llave copiada");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Apoyar el proyecto"
          >
            <Heart
              className="size-3.5 text-[var(--panini-red)] group-hover:scale-110 transition-transform"
              fill="currentColor"
            />
            Apoya el proyecto
          </button>
        }
      />
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
            "w-[min(420px,94vw)] max-h-[88vh] flex flex-col",
            "bg-card border rounded-2xl shadow-2xl overflow-hidden outline-none",
            "duration-200",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="relative px-6 pt-7 pb-5 border-b text-center">
            <DialogPrimitive.Close
              aria-label="Cerrar"
              className="absolute top-3 right-3 size-9 rounded-full grid place-items-center hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>

            <div className="mx-auto size-12 rounded-full grid place-items-center bg-[var(--panini-red)]/10 text-[var(--panini-red)] mb-3">
              <Coffee className="size-5" />
            </div>
            <DialogPrimitive.Title className="font-display text-xl font-semibold tracking-tight">
              ¡Gracias por estar aquí!
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5 px-2">
              Este álbum lo hacemos JD y su papá. Si te gusta, ayúdanos con
              los servidores ☕
            </DialogPrimitive.Description>
          </div>

          <div className="overflow-y-auto p-5 space-y-5">
            {/* Bre-b */}
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-semibold">
                  Bre-b · Bancolombia{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    🇨🇴
                  </span>
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Sin comisión
                </span>
              </div>
              <div className="rounded-xl border bg-muted/30 p-3 flex gap-3 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/support/breb-qr.jpg"
                  alt="QR de pago Bre-b"
                  className="size-24 rounded-md ring-1 ring-border shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Escanea el QR desde tu app del banco o paga con la llave:
                  </p>
                  <button
                    type="button"
                    onClick={copyKey}
                    className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-sm font-mono hover:bg-muted transition-colors w-full justify-between"
                  >
                    <span className="font-semibold truncate">{BREB_KEY}</span>
                    <Copy
                      className={cn(
                        "size-3.5 shrink-0 transition-colors",
                        copied ? "text-[var(--gold)]" : "text-muted-foreground",
                      )}
                    />
                  </button>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                o
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* PayPal */}
            <section className="space-y-3">
              <h3 className="font-display font-semibold">
                PayPal{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  🌎 internacional
                </span>
              </h3>
              <a
                href={PAYPAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border bg-[#0070BA]/5 hover:bg-[#0070BA]/10 border-[#0070BA]/20 px-4 py-3 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm">
                    paypal.me/jhonatancastropolo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Abre PayPal en una nueva pestaña
                  </p>
                </div>
                <ExternalLink className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </a>
            </section>

            <p className="text-[11px] text-muted-foreground italic text-center pt-1">
              No es obligatorio. Pero cada cafecito ayuda 💛
            </p>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
