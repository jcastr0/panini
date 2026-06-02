"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DIAL_CODES,
  splitDialCode,
  dialCodeForCountry,
} from "@/lib/dial-codes";

/**
 * Input combinado de teléfono internacional con select de código país.
 * - value: E.164 sin '+' (ej. "573001234567") o ""
 * - onChange recibe el value combinado o "" si el localNumber está vacío
 * - countryHint: si el user tiene country='Colombia' arranca con +57
 *   (a menos que value ya tenga un dialCode distinto)
 */
export function PhoneInput({
  value,
  onChange,
  name,
  disabled = false,
  countryHint,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Si se usa como hidden input dentro de un form clásico */
  name?: string;
  disabled?: boolean;
  /** profiles.country del user — para sugerir el dialCode por default */
  countryHint?: string | null;
  className?: string;
}) {
  // Determinar dialCode inicial: si hay value se infiere, si no se usa countryHint
  const initial = React.useMemo(() => {
    if (value && value.length > 0) {
      return splitDialCode(value);
    }
    return { dialCode: dialCodeForCountry(countryHint), local: "" };
  }, [value, countryHint]);

  const [dialCode, setDialCode] = React.useState(initial.dialCode);
  const [local, setLocal] = React.useState(initial.local);

  // Si llega un value externo distinto (ej. reset del form), sincronizar
  React.useEffect(() => {
    if (value === `${dialCode}${local}`) return;
    if (value && value.length > 0) {
      const s = splitDialCode(value);
      setDialCode(s.dialCode);
      setLocal(s.local);
    } else {
      // value vacío — mantener dialCode actual, limpiar local
      setLocal("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(nextDial: string, nextLocal: string) {
    const cleaned = nextLocal.replace(/\D/g, "");
    setDialCode(nextDial);
    setLocal(cleaned);
    onChange(cleaned.length === 0 ? "" : `${nextDial}${cleaned}`);
  }

  const expectedLen = DIAL_CODES.find((d) => d.code === dialCode)?.localLength;
  const placeholder = expectedLen ? "3".padEnd(expectedLen, "0").slice(0, expectedLen) : "3001234567";

  return (
    <div className={cn("flex gap-2", className)}>
      <Select
        value={dialCode}
        onValueChange={(v) => v && update(v, local)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[8.5rem] shrink-0">
          <SelectValue placeholder="País" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {DIAL_CODES.map((dc) => (
            <SelectItem key={dc.code + dc.country} value={dc.code}>
              <span className="inline-flex items-center gap-2">
                <span className="text-base leading-none">{dc.flag}</span>
                <span className="font-mono">+{dc.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        value={local}
        onChange={(e) => update(dialCode, e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={15}
        className="flex-1 font-mono"
      />
      {name && <input type="hidden" name={name} value={local.length === 0 ? "" : `${dialCode}${local}`} />}
    </div>
  );
}
