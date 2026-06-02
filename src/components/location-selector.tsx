"use client";

import * as React from "react";
import { Globe, MapPin } from "lucide-react";
import {
  COLOMBIA,
  DEPARTMENT_NAMES,
  getCitiesOf,
} from "@/lib/colombia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LocationValue = {
  country: string;
  department: string | null;
  city: string;
};

const OTRO_CITY = "Otro";

const DEPARTMENT_OPTIONS: ComboboxOption[] = DEPARTMENT_NAMES.map((d) => ({
  value: d,
  label: d,
}));

/**
 * Selector de ubicación con cascading dropdowns shadcn:
 *  - País: Colombia / Otro (input libre si "Otro")
 *  - Si Colombia: Departamento → Municipio (con opción "Otro" libre)
 *  - Si extranjero: input libre para ciudad
 */
export function LocationSelector({
  value,
  onChange,
  disabled = false,
  required = true,
}: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const isColombia = value.country === "Colombia";
  const cities = isColombia && value.department
    ? getCitiesOf(value.department)
    : [];
  const cityIsCustom =
    isColombia &&
    value.department !== null &&
    value.city !== "" &&
    !cities.includes(value.city);
  const [customCity, setCustomCity] = React.useState(
    cityIsCustom ? value.city : "",
  );
  const [showCustomCity, setShowCustomCity] = React.useState(cityIsCustom);

  function setCountrySelection(next: string | null) {
    if (next === "Colombia") {
      onChange({ country: "Colombia", department: null, city: "" });
    } else {
      onChange({ country: "", department: null, city: "" });
    }
    setShowCustomCity(false);
    setCustomCity("");
  }

  function setDepartment(next: string | null) {
    onChange({ ...value, department: next ?? null, city: "" });
    setShowCustomCity(false);
    setCustomCity("");
  }

  function setCity(next: string | null) {
    if (next === OTRO_CITY) {
      setShowCustomCity(true);
      setCustomCity("");
      onChange({ ...value, city: "" });
    } else {
      setShowCustomCity(false);
      onChange({ ...value, city: next ?? "" });
    }
  }

  function setCustomCityValue(next: string) {
    setCustomCity(next);
    onChange({ ...value, city: next });
  }

  // Para el SelectValue del campo ciudad
  const citySelectValue =
    !value.city ? "" : cities.includes(value.city) ? value.city : OTRO_CITY;

  return (
    <div className="space-y-3">
      {/* País */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground" />
          País {required && <span className="text-[var(--panini-red)]">*</span>}
        </Label>
        <Select
          value={isColombia ? "Colombia" : "Otro"}
          onValueChange={setCountrySelection}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona país…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Colombia">🇨🇴 Colombia</SelectItem>
            <SelectItem value="Otro">🌎 Otro país</SelectItem>
          </SelectContent>
        </Select>
        {!isColombia && (
          <Input
            type="text"
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            placeholder="Escribe tu país"
            disabled={disabled}
            required={required}
            maxLength={50}
          />
        )}
      </div>

      {/* Departamento (solo Colombia) */}
      {isColombia && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground" />
            Departamento {required && <span className="text-[var(--panini-red)]">*</span>}
          </Label>
          <Combobox
            value={value.department ?? ""}
            onChange={(v) => setDepartment(v)}
            options={DEPARTMENT_OPTIONS}
            placeholder="Selecciona departamento…"
            searchPlaceholder="Buscar departamento…"
            emptyText="Sin coincidencias"
            disabled={disabled}
          />
        </div>
      )}

      {/* Ciudad */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          {isColombia ? "Municipio" : "Ciudad"} {required && <span className="text-[var(--panini-red)]">*</span>}
        </Label>

        {isColombia ? (
          value.department ? (
            <>
              <Combobox
                value={citySelectValue}
                onChange={(v) => setCity(v)}
                options={[
                  ...(COLOMBIA.find((d) => d.name === value.department)?.cities ?? []).map(
                    (c) => ({ value: c, label: c }),
                  ),
                  { value: OTRO_CITY, label: "— Otro municipio —", hint: "escribir" },
                ]}
                placeholder="Selecciona municipio…"
                searchPlaceholder="Buscar municipio…"
                emptyText="Sin coincidencias. Usa 'Otro' para escribir."
                disabled={disabled}
              />
              {showCustomCity && (
                <Input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCityValue(e.target.value)}
                  placeholder="Escribe el nombre del municipio"
                  disabled={disabled}
                  required={required}
                  maxLength={50}
                />
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Primero elige tu departamento.
            </p>
          )
        ) : (
          <Input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Ciudad donde vives"
            disabled={disabled}
            required={required}
            maxLength={50}
          />
        )}
      </div>
    </div>
  );
}
