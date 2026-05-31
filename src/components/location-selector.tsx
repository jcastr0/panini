"use client";

import * as React from "react";
import { Globe, MapPin } from "lucide-react";
import {
  COLOMBIA,
  DEPARTMENT_NAMES,
  getCitiesOf,
} from "@/lib/colombia";

export type LocationValue = {
  country: string;
  department: string | null;
  city: string;
};

/**
 * Selector de ubicación: si país = Colombia, cascading dropdowns
 * (departamento → ciudad) con opción "Otro municipio" libre.
 * Si país ≠ Colombia, dos inputs libres (país, ciudad).
 *
 * Controlado: el parent gestiona el estado y recibe cambios via onChange.
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
  const showCustomCityInput =
    isColombia && (value.city === "Otro" || (value.city && !cities.includes(value.city) && value.city !== ""));
  const [customCity, setCustomCity] = React.useState(
    showCustomCityInput && value.city !== "Otro" ? value.city : "",
  );

  function setCountry(next: string) {
    if (next === "Colombia") {
      onChange({ country: "Colombia", department: null, city: "" });
    } else {
      onChange({ country: next, department: null, city: "" });
    }
  }

  function setDepartment(next: string) {
    onChange({ ...value, department: next || null, city: "" });
  }

  function setCity(next: string) {
    if (next === "Otro") {
      onChange({ ...value, city: "Otro" });
      setCustomCity("");
    } else {
      onChange({ ...value, city: next });
    }
  }

  function setCustomCityValue(next: string) {
    setCustomCity(next);
    onChange({ ...value, city: next });
  }

  return (
    <div className="space-y-3">
      {/* País */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Globe className="size-3.5 text-muted-foreground" />
          País {required && <span className="text-[var(--panini-red)]">*</span>}
        </label>
        <select
          value={isColombia ? "Colombia" : value.country || "Colombia"}
          onChange={(e) => {
            if (e.target.value === "Otro") {
              setCountry("");
            } else {
              setCountry(e.target.value);
            }
          }}
          disabled={disabled}
          className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="Colombia">🇨🇴 Colombia</option>
          <option value="Otro">🌎 Otro país</option>
        </select>
        {!isColombia && (
          <input
            type="text"
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
            placeholder="Escribe tu país"
            disabled={disabled}
            required={required}
            maxLength={50}
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        )}
      </div>

      {/* Departamento (solo Colombia) */}
      {isColombia && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground" />
            Departamento {required && <span className="text-[var(--panini-red)]">*</span>}
          </label>
          <select
            value={value.department ?? ""}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={disabled}
            required={required}
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="">Selecciona…</option>
            {DEPARTMENT_NAMES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      {/* Ciudad */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted-foreground" />
          {isColombia ? "Municipio" : "Ciudad"} {required && <span className="text-[var(--panini-red)]">*</span>}
        </label>

        {isColombia ? (
          value.department ? (
            <>
              <select
                value={
                  value.city && cities.includes(value.city)
                    ? value.city
                    : value.city === ""
                      ? ""
                      : "Otro"
                }
                onChange={(e) => setCity(e.target.value)}
                disabled={disabled}
                required={required}
                className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="">Selecciona…</option>
                {COLOMBIA.find((d) => d.name === value.department)?.cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="Otro">— Otro municipio —</option>
              </select>
              {(value.city === "Otro" || showCustomCityInput) && (
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCityValue(e.target.value)}
                  placeholder="Escribe el nombre del municipio"
                  disabled={disabled}
                  required={required}
                  maxLength={50}
                  className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                />
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Primero elige tu departamento.
            </p>
          )
        ) : (
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="Ciudad donde vives"
            disabled={disabled}
            required={required}
            maxLength={50}
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        )}
      </div>
    </div>
  );
}
