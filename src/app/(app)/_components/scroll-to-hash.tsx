"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hace scroll automático al elemento con id = window.location.hash cuando
 * la página termina de renderizar. Reintenta hasta 3 segundos por si el
 * contenido aún está cargando (server components, lazy images, etc.).
 *
 * Bonus: agrega un highlight temporal al cromo destino para que el user
 * sepa cuál era el que buscaba.
 *
 * Se monta en el layout global, así funciona en todas las rutas del álbum.
 */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 100ms = 3s

    const tick = () => {
      if (cancelled) return;
      attempts++;
      const el = document.getElementById(decodeURIComponent(hash));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight con ring que se desvanece
        el.classList.add(
          "ring-4",
          "ring-[var(--panini-blue)]",
          "ring-offset-2",
          "ring-offset-background",
          "rounded-xl",
          "transition-all",
        );
        setTimeout(() => {
          el.classList.remove(
            "ring-4",
            "ring-[var(--panini-blue)]",
            "ring-offset-2",
            "ring-offset-background",
            "rounded-xl",
          );
        }, 2500);
      } else if (attempts < MAX_ATTEMPTS) {
        setTimeout(tick, 100);
      }
    };
    // Primer intento inmediato + reintento si no estaba en DOM aún
    tick();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
