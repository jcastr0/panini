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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LocationValue = {
  country: string;
  department: string | null;
  city: string;
};

const OTRO_CITY = "Otro";

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
          <Select
            value={value.department ?? ""}
            onValueChange={setDepartment}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona departamento…" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENT_NAMES.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <Select
                value={citySelectValue}
                onValueChange={setCity}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona municipio…" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {COLOMBIA.find((d) => d.name === value.department)?.cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value={OTRO_CITY}>— Otro municipio —</SelectItem>
                </SelectContent>
              </Select>
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
