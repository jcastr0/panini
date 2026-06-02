"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const STORAGE_KEY = "paninijd.dismissed_phone_campaign";
// Campaña expira 6 de junio 2026 (timestamp UTC)
const CAMPAIGN_END = Date.UTC(2026, 5, 6, 23, 59, 59); // mes=5 → junio (0-indexed)

/**
 * Banner sutil que invita a agregar WhatsApp al perfil. Solo se ve cuando:
 *  - El user todavía no tiene phone
 *  - La campaña no expiró (≤ 6 jun 2026)
 *  - El user no lo descartó (localStorage)
 * Si llena su phone en /profile, el server limpia la flag y vuelve a aparecer
 * NO (porque ya tiene phone).
 */
export function PhoneCampaignBanner({ phoneMissing }: { phoneMissing: boolean }) {
  const [dismissed, setDismissed] = React.useState(true); // SSR-safe: empieza oculto

  React.useEffect(() => {
    if (!phoneMissing) return;
    if (Date.now() > CAMPAIGN_END) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "true") setDismissed(false);
    } catch {
      // localStorage inaccesible → mostrar
      setDismissed(false);
    }
  }, [phoneMissing]);

  if (!phoneMissing || dismissed) return null;

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div
      className="border-b"
      style={{
        background:
          "linear-gradient(90deg, color-mix(in oklab, #25D366 8%, var(--background)) 0%, var(--background) 100%)",
        borderColor: "color-mix(in oklab, #25D366 30%, transparent)",
      }}
      role="region"
      aria-label="Sugerencia: agrega tu WhatsApp"
    >
      <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-3 text-sm">
        <span className="size-7 rounded-full grid place-items-center bg-[#25D366]/15 text-[#25D366] shrink-0">
          <WhatsAppIcon className="size-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium leading-tight truncate">
            ¿Agregas tu WhatsApp?
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight truncate hidden sm:block">
            Para que tus amigos te escriban directo al armar un intercambio.
          </p>
        </div>
        <Link
          href="/profile#phone"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white px-3.5 h-8 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Agregarlo
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Omitir"
          className="size-7 rounded-full grid place-items-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
