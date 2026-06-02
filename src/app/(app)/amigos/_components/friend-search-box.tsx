"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SearchResult = {
  id: string;
  username: string;
  display_name: string | null;
  city: string | null;
};

/**
 * Caja de búsqueda con autocomplete en vivo. Reemplaza el form GET clásico
 * para que sea más rápido en mobile (sin recargar página).
 *
 * Mantiene `initialQuery` para que cuando se llega desde un share-link
 * (?q=X) muestre la consulta y permita "limpiar".
 */
export function FriendSearchBox({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Debounce 200ms — fetch al endpoint de search
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
          `/api/amigos/search?q=${encodeURIComponent(query.trim())}`,
          { signal: ctrl.signal },
        );
        if (!r.ok) return;
        const json = (await r.json()) as { results?: SearchResult[] };
        setResults(json.results ?? []);
      } catch {
        /* ignore abort */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  function goToProfile(username: string) {
    setOpen(false);
    router.push(`/u/${username}`);
  }

  function clearAndReload() {
    setQuery("");
    setResults([]);
    setOpen(false);
    router.push("/amigos");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="group/search relative w-full flex items-center rounded-full border bg-card focus-within:ring-2 focus-within:ring-ring transition-shadow"
        aria-label="Buscar coleccionista"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder="Busca por @username o nombre"
          className="w-full h-12 pl-11 pr-10 bg-transparent text-base focus:outline-none rounded-full"
          autoComplete="off"
        />
        {query && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Limpiar"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              clearAndReload();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-7 rounded-full grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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
          <CommandList className="max-h-72">
            {loading && (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Buscando…
              </div>
            )}
            {!loading && query.trim().length > 0 && results.length === 0 && (
              <CommandEmpty>
                Nadie con &quot;{query.trim()}&quot;.
              </CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup heading="Coleccionistas">
                {results.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={r.username}
                    onSelect={() => goToProfile(r.username)}
                    className="cursor-pointer flex items-center gap-2"
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
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {query.trim().length === 0 && (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Escribe para buscar coleccionistas.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
