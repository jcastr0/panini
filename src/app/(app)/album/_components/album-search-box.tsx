"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Hit = {
  code: string;
  team: string | null;
  group_code: string | null;
  type: string;
  page: number | null;
  name: string;
  url: string;
};

/**
 * Buscador global en /album. Acepta cualquier código (MEX10, BRA13, FWC1,
 * CC5, 19, LEGARG17) o un nombre/equipo. Al elegir un resultado, navega
 * a la página del cromo con anchor para scroll.
 */
export function AlbumSearchBox() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Hit[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Debounce fetch al endpoint
  React.useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setLoading(false);
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

  function goTo(url: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(url);
  }

  function clear() {
    setQuery("");
    setResults([]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="group/search relative w-full flex items-center rounded-full border bg-card focus-within:ring-2 focus-within:ring-ring transition-shadow"
        aria-label="Buscar cromo en el álbum"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder="Busca un cromo (ej. MEX10, BRA13, Lozano)"
          className="w-full h-10 pl-10 pr-9 bg-transparent text-sm focus:outline-none rounded-full"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Limpiar"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clear();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="p-0 w-[var(--anchor-width)] min-w-[18rem]"
        style={{ width: "var(--anchor-width)" }}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-80">
            {loading && (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Buscando…
              </div>
            )}
            {!loading && query.trim().length > 0 && results.length === 0 && (
              <CommandEmpty>
                No hay cromos con &quot;{query.trim()}&quot;.
              </CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Cromos">
                {results.map((r) => (
                  <CommandItem
                    key={r.url}
                    value={r.code}
                    onSelect={() => goTo(r.url)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <span className="font-mono font-semibold text-[var(--panini-blue)] min-w-[3.5rem]">
                      {r.code}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm">{r.name}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {r.team
                          ? r.team
                          : r.type === "legend"
                            ? "Legend"
                            : (r.group_code ?? "")}
                      </span>
                    </span>
                    {r.type === "shiny" || r.type === "legend" ? (
                      <Sparkles className="size-3.5 text-[var(--gold)] shrink-0" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {query.trim().length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Escribe el código (MEX10, FWC1, CC5) o un nombre.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
