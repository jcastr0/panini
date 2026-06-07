"use client";

import * as React from "react";
import { Check } from "lucide-react";

/**
 * Wrapper de un cromo (sustituye al <li>) que añade un check sutil en la
 * esquina superior izquierda para marcar "ya lo tengo listo para entregar".
 * Estado en localStorage por (trade, item) — NO se persiste en DB, es solo
 * un ayudante visual mientras el usuario busca los cromos físicos.
 */
export function ReadyCheckOverlay({
  tradeId,
  itemId,
  unavailable,
  title,
  children,
}: {
  tradeId: string;
  itemId: string;
  unavailable: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  const storageKey = `paninijd:trade-ready:${tradeId}:${itemId}`;
  const [checked, setChecked] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      setChecked(localStorage.getItem(storageKey) === "1");
    } catch {
      /* localStorage no disponible */
    }
    setHydrated(true);
  }, [storageKey]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !checked;
    setChecked(next);
    try {
      if (next) localStorage.setItem(storageKey, "1");
      else localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }

  return (
    <li
      title={title}
      className={`relative rounded-lg overflow-hidden border bg-muted/30 group transition-all ${
        unavailable ? "opacity-40" : ""
      } ${
        hydrated && checked
          ? "opacity-60 ring-2 ring-emerald-500/70 ring-offset-1 ring-offset-card"
          : ""
      }`}
    >
      <button
        type="button"
        aria-label={checked ? "Desmarcar listo" : "Marcar como listo para entregar"}
        title={checked ? "Listo para entregar" : "Marcar cuando lo tengas a mano"}
        onClick={toggle}
        className={`absolute top-1 left-1 z-10 size-6 rounded-full border grid place-items-center backdrop-blur-sm transition-all ${
          checked
            ? "bg-emerald-500 text-white border-emerald-600 shadow"
            : "bg-card/85 border-foreground/25 text-muted-foreground hover:bg-card hover:border-foreground/60"
        }`}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </button>
      {children}
    </li>
  );
}
