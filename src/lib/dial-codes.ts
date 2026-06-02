/**
 * Códigos de marcación (dial codes) más comunes para usuarios de la app.
 * Optimizado para LATAM + algunos extras. Colombia primero por default.
 *
 * El `code` es el código numérico SIN '+' (lo que va al inicio del E.164).
 */
export type DialCode = {
  code: string;        // ej. "57"
  flag: string;        // emoji 🇨🇴
  country: string;     // nombre legible
  /** Largo típico del número local (sin código). Para hint en UX. */
  localLength?: number;
};

export const DEFAULT_DIAL_CODE = "57";

export const DIAL_CODES: DialCode[] = [
  { code: "57",  flag: "🇨🇴", country: "Colombia",      localLength: 10 },
  { code: "52",  flag: "🇲🇽", country: "México",        localLength: 10 },
  { code: "1",   flag: "🇺🇸", country: "USA / Canadá",  localLength: 10 },
  { code: "34",  flag: "🇪🇸", country: "España",        localLength: 9  },
  { code: "54",  flag: "🇦🇷", country: "Argentina",     localLength: 10 },
  { code: "55",  flag: "🇧🇷", country: "Brasil",        localLength: 11 },
  { code: "56",  flag: "🇨🇱", country: "Chile",         localLength: 9  },
  { code: "51",  flag: "🇵🇪", country: "Perú",          localLength: 9  },
  { code: "58",  flag: "🇻🇪", country: "Venezuela",     localLength: 10 },
  { code: "593", flag: "🇪🇨", country: "Ecuador",       localLength: 9  },
  { code: "591", flag: "🇧🇴", country: "Bolivia",       localLength: 8  },
  { code: "595", flag: "🇵🇾", country: "Paraguay",      localLength: 9  },
  { code: "598", flag: "🇺🇾", country: "Uruguay",       localLength: 8  },
  { code: "53",  flag: "🇨🇺", country: "Cuba",          localLength: 8  },
  { code: "507", flag: "🇵🇦", country: "Panamá",        localLength: 8  },
  { code: "506", flag: "🇨🇷", country: "Costa Rica",    localLength: 8  },
  { code: "503", flag: "🇸🇻", country: "El Salvador",   localLength: 8  },
  { code: "502", flag: "🇬🇹", country: "Guatemala",     localLength: 8  },
  { code: "504", flag: "🇭🇳", country: "Honduras",      localLength: 8  },
  { code: "44",  flag: "🇬🇧", country: "Reino Unido",   localLength: 10 },
  { code: "33",  flag: "🇫🇷", country: "Francia",       localLength: 9  },
  { code: "49",  flag: "🇩🇪", country: "Alemania",      localLength: 11 },
  { code: "39",  flag: "🇮🇹", country: "Italia",        localLength: 10 },
];

/**
 * Mapeo país (de profiles.country) → dialCode default.
 * Si el user tiene Argentina como país, el phone input arranca con +54.
 */
const COUNTRY_TO_DIAL: Record<string, string> = {
  Colombia: "57",
  México: "52",
  Argentina: "54",
  Brasil: "55",
  Chile: "56",
  Perú: "51",
  Venezuela: "58",
  Ecuador: "593",
  Bolivia: "591",
  Paraguay: "595",
  Uruguay: "598",
  Cuba: "53",
  Panamá: "507",
  "Costa Rica": "506",
  "El Salvador": "503",
  Guatemala: "502",
  Honduras: "504",
  España: "34",
  "USA": "1",
  "Estados Unidos": "1",
  Canadá: "1",
};

export function dialCodeForCountry(country: string | null | undefined): string {
  if (!country) return DEFAULT_DIAL_CODE;
  return COUNTRY_TO_DIAL[country] ?? DEFAULT_DIAL_CODE;
}

/**
 * Dado un E.164 sin '+', intenta separar dialCode + número local.
 * Prueba con los códigos conocidos en orden de longitud descendente
 * (para que "593" matchee antes que "59" o "5").
 */
export function splitDialCode(
  e164Digits: string | null | undefined,
): { dialCode: string; local: string } {
  if (!e164Digits) return { dialCode: DEFAULT_DIAL_CODE, local: "" };
  const sorted = [...DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const dc of sorted) {
    if (e164Digits.startsWith(dc.code)) {
      return { dialCode: dc.code, local: e164Digits.slice(dc.code.length) };
    }
  }
  // No matchea ningún conocido — asumimos el largo del code default
  return { dialCode: DEFAULT_DIAL_CODE, local: e164Digits };
}
