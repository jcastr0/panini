"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Check, Copy } from "lucide-react";

type Hit = {
  code: string;
  team: string | null;
  group_code: string | null;
  type: string;
  page: number | null;
  name: string;
  url: string;
  qty: number;
};

/**
 * Búsqueda global en /album. Input + dropdown absolute (sin Popover) para
 * no perder el focus en mobile (el Popover mueve el focus al abrir y eso
 * cierra el teclado en cada tecla).
 */
export function AlbumSearchBox() {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Hit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);

  // Debounce fetch
  React.useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setLoading(false);
      setActiveIdx(-1);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/album/lookup?q=${encodeURIComponent(query.trim())}`,
          { signal: ctrl.signal },
        );
        if (!r.ok) return;
        const json = (await r.json()) as { results?: Hit[] };
        setResults(json.results ?? []);
        setActiveIdx(json.results && json.results.length > 0 ? 0 : -1);
      } catch {
        /* abort */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  // Cerrar dropdown al click fuera
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  function goTo(url: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIdx(-1);
    router.push(url);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setActiveIdx(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && query.trim().length > 0 && results.length > 0) {
        goTo(results[0].url);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIdx >= 0 ? activeIdx : 0];
      if (target) goTo(target.url);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative w-full flex items-center rounded-full border bg-card focus-within:ring-2 focus-within:ring-ring transition-shadow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Busca un cromo (ej. MEX10, BRA13, Lozano)"
          className="w-full h-10 pl-10 pr-9 bg-transparent text-sm focus:outline-none rounded-full"
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar cromo en el álbum"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-lg border bg-popover shadow-lg ring-1 ring-foreground/10 overflow-hidden"
          // Importante: NO autofocus al abrir
        >
          <div className="max-h-80 overflow-y-auto py-1">
            {loading && (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                Buscando…
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                No hay cromos con &quot;{query.trim()}&quot;.
              </div>
            )}
            {results.length > 0 && (
              <ul role="listbox" className="space-y-0.5">
                {results.map((r, i) => {
                  const status =
                    r.qty >= 2 ? "duplicate" : r.qty === 1 ? "owned" : "missing";
                  return (
                    <li
                      key={r.url}
                      role="option"
                      aria-selected={i === activeIdx}
                      onMouseDown={(e) => {
                        // Evita perder focus del input antes del click
                        e.preventDefault();
                      }}
                      onClick={() => goTo(r.url)}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                        i === activeIdx ? "bg-muted/80" : "hover:bg-muted/40"
                      }`}
                    >
                      {/* Estado visual: tienes / repetido / no tienes */}
                      <span
                        className={`size-7 rounded-full grid place-items-center shrink-0 ${
                          status === "duplicate"
                            ? "bg-[var(--gold)]/15 text-[color:var(--gold)]"
                            : status === "owned"
                              ? "bg-[var(--panini-blue)]/15 text-[var(--panini-blue)]"
                              : "bg-muted text-muted-foreground"
                        }`}
                        title={
                          status === "duplicate"
                            ? `Repetido (x${r.qty})`
                            : status === "owned"
                              ? "Lo tienes"
                              : "Te falta"
                        }
                      >
                        {status === "duplicate" ? (
                          <span className="text-[10px] font-bold tabular leading-none">
                            ×{r.qty}
                          </span>
                        ) : status === "owned" ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : (
                          <Copy className="size-3.5 rotate-180" />
                        )}
                      </span>
                      <span className="font-mono font-semibold text-[var(--panini-blue)] min-w-[3.5rem]">
                        {r.code}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block truncate">{r.name}</span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {r.team
                            ? r.team
                            : r.type === "legend"
                              ? "Legend"
                              : (r.group_code ?? "")}
                          {status === "missing" && (
                            <>
                              {" "}
                              · <span className="text-[var(--panini-red)] font-semibold">te falta</span>
                            </>
                          )}
                          {status === "duplicate" && (
                            <>
                              {" "}
                              · <span className="text-[var(--gold)] font-semibold">repetido</span>
                            </>
                          )}
                        </span>
                      </span>
                      {(r.type === "shiny" || r.type === "legend") && (
                        <Sparkles className="size-3.5 text-[var(--gold)] shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
