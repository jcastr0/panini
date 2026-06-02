"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

export type ComboboxOption = {
  value: string;
  label: string;
  /** Texto opcional al lado del label (ej. región/contexto). */
  hint?: string;
};

/**
 * Combobox con búsqueda — para listas largas donde un select normal sería
 * cansón (departamentos, municipios, equipos). Usa shadcn Command + Popover.
 *
 * Uso:
 *   <Combobox
 *     value={department}
 *     onChange={setDepartment}
 *     options={departmentOptions}
 *     placeholder="Selecciona departamento…"
 *     searchPlaceholder="Buscar departamento…"
 *     emptyText="Sin resultados"
 *   />
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados",
  disabled = false,
  clearable = true,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Mostrar botón ✕ para limpiar la selección cuando hay valor. Default: true */
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  const showClear = clearable && !!selected && !disabled;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "group/cb relative flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 pr-9 text-sm text-left",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-popup-open:ring-2 data-popup-open:ring-ring",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        {showClear ? (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Limpiar selección"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-6 grid place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="p-0 w-[var(--anchor-width)] min-w-[16rem]"
        style={{ width: "var(--anchor-width)" }}
      >
        <Command shouldFilter>
          <CommandInput placeholder={searchPlaceholder} className="h-10" />
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.hint ?? ""}`}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      value === o.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate flex-1">{o.label}</span>
                  {o.hint && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {o.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
