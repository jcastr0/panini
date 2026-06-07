"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

type SearchResult = {
  id: string;
  username: string;
  display_name: string | null;
  city: string | null;
};

/**
 * Caja de búsqueda con autocomplete en vivo. Sin Popover (preserva focus
 * del input en mobile para que no se cierre el teclado al teclear).
 */
export function FriendSearchBox({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);

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
          `/api/amigos/search?q=${encodeURIComponent(query.trim())}`,
          { signal: ctrl.signal },
        );
        if (!r.ok) return;
        const json = (await r.json()) as { results?: SearchResult[] };
        setResults(json.results ?? []);
        setActiveIdx(json.results && json.results.length > 0 ? 0 : -1);
      } catch {
        /* abort */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  // Cerrar al click fuera
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  function goToProfile(username: string) {
    setOpen(false);
    router.push(`/u/${username}`);
  }

  function clearAndReload() {
    setQuery("");
    setResults([]);
    setActiveIdx(-1);
    setOpen(false);
    router.push("/amigos");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && results.length > 0) goToProfile(results[0].username);
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
      if (target) goToProfile(target.username);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative w-full flex items-center rounded-full border bg-card focus-within:ring-2 focus-within:ring-ring transition-shadow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Busca por @username o nombre"
          className="w-full h-12 pl-11 pr-10 bg-transparent text-base focus:outline-none rounded-full"
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar coleccionista"
        />
        {query && (
          <button
            type="button"
            aria-label="Limpiar"
            onClick={clearAndReload}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border bg-popover shadow-lg ring-1 ring-foreground/10 overflow-hidden">
          <div className="max-h-72 overflow-y-auto py-1">
            {loading && (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                Buscando…
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                Nadie con &quot;{query.trim()}&quot;.
              </div>
            )}
            {results.length > 0 && (
              <ul role="listbox" className="space-y-0.5">
                {results.map((r, i) => (
                  <li
                    key={r.id}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProfile(r.username)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors ${
                      i === activeIdx ? "bg-muted/80" : "hover:bg-muted/40"
                    }`}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {r.display_name || `@${r.username}`}
                      </span>
                      <span className="text-xs text-muted-foreground truncate block">
                        @{r.username}
                        {r.city ? ` · ${r.city}` : ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
