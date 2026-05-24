/**
 * Paleta y metadatos del álbum del Mundial 2026.
 * Una sola fuente de verdad para identidad visual por grupo/sección.
 */

export type GroupCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export const GROUP_CODES: GroupCode[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

// Paleta de 12 grupos: hues distribuidos cada ~30° para máxima distinción.
// Accents vibrantes para protagonismo tipográfico; tints muy claros pastel.
// Tags = sobrenombre/identidad de la selección principal de cada grupo.
export const GROUP_PALETTES: Record<
  GroupCode,
  { accent: string; tint: string; tag: string }
> = {
  A: { accent: "oklch(0.62 0.20 28)",  tint: "oklch(0.975 0.030 45)",  tag: "El Tri"          },
  B: { accent: "oklch(0.62 0.16 230)", tint: "oklch(0.975 0.020 225)", tag: "Maple"           },
  C: { accent: "oklch(0.55 0.18 150)", tint: "oklch(0.975 0.035 150)", tag: "Verdeamarela"    },
  D: { accent: "oklch(0.55 0.20 300)", tint: "oklch(0.975 0.030 300)", tag: "Stars & Stripes" },
  E: { accent: "oklch(0.68 0.16 80)",  tint: "oklch(0.975 0.040 85)",  tag: "Die Mannschaft"  },
  F: { accent: "oklch(0.62 0.22 350)", tint: "oklch(0.975 0.030 350)", tag: "Oranje"          },
  G: { accent: "oklch(0.60 0.13 195)", tint: "oklch(0.975 0.020 195)", tag: "Diablos Rojos"   },
  H: { accent: "oklch(0.68 0.18 55)",  tint: "oklch(0.975 0.040 65)",  tag: "La Roja"         },
  I: { accent: "oklch(0.55 0.22 320)", tint: "oklch(0.975 0.030 320)", tag: "Les Bleus"       },
  J: { accent: "oklch(0.52 0.20 260)", tint: "oklch(0.975 0.030 265)", tag: "Albiceleste"     },
  K: { accent: "oklch(0.62 0.18 115)", tint: "oklch(0.975 0.040 115)", tag: "Cafeteros"       },
  L: { accent: "oklch(0.50 0.18 15)",  tint: "oklch(0.975 0.030 20)",  tag: "Three Lions"     },
};

export type SpecialKey = "apertura" | "historia" | "coca-cola";

export const SPECIAL_SECTIONS: Record<
  SpecialKey,
  { accent: string; tint: string; label: string; emoji: string }
> = {
  apertura:    { accent: "var(--pitch)",      tint: "oklch(0.96 0.02 90)",  label: "Apertura",    emoji: "🎉" },
  historia:    { accent: "var(--gold)",       tint: "oklch(0.96 0.05 85)",  label: "Historia",    emoji: "🏆" },
  "coca-cola": { accent: "var(--panini-red)", tint: "oklch(0.96 0.04 25)",  label: "Coca-Cola",   emoji: "⭐" },
};

/** Equipos por grupo con bandera emoji — coincide con el seed real */
export const GROUP_TEAMS: Record<GroupCode, Array<{ name: string; flag: string }>> = {
  A: [
    { name: "México",        flag: "🇲🇽" },
    { name: "Sudáfrica",     flag: "🇿🇦" },
    { name: "Corea del Sur", flag: "🇰🇷" },
    { name: "Chequia",       flag: "🇨🇿" },
  ],
  B: [
    { name: "Canadá",               flag: "🇨🇦" },
    { name: "Bosnia y Herzegovina", flag: "🇧🇦" },
    { name: "Qatar",                flag: "🇶🇦" },
    { name: "Suiza",                flag: "🇨🇭" },
  ],
  C: [
    { name: "Brasil",    flag: "🇧🇷" },
    { name: "Marruecos", flag: "🇲🇦" },
    { name: "Haití",     flag: "🇭🇹" },
    { name: "Escocia",   flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  ],
  D: [
    { name: "Estados Unidos", flag: "🇺🇸" },
    { name: "Paraguay",       flag: "🇵🇾" },
    { name: "Australia",      flag: "🇦🇺" },
    { name: "Turquía",        flag: "🇹🇷" },
  ],
  E: [
    { name: "Alemania",        flag: "🇩🇪" },
    { name: "Curazao",         flag: "🇨🇼" },
    { name: "Costa de Marfil", flag: "🇨🇮" },
    { name: "Ecuador",         flag: "🇪🇨" },
  ],
  F: [
    { name: "Países Bajos", flag: "🇳🇱" },
    { name: "Japón",        flag: "🇯🇵" },
    { name: "Suecia",       flag: "🇸🇪" },
    { name: "Túnez",        flag: "🇹🇳" },
  ],
  G: [
    { name: "Bélgica",       flag: "🇧🇪" },
    { name: "Egipto",        flag: "🇪🇬" },
    { name: "Irán",          flag: "🇮🇷" },
    { name: "Nueva Zelanda", flag: "🇳🇿" },
  ],
  H: [
    { name: "España",         flag: "🇪🇸" },
    { name: "Cabo Verde",     flag: "🇨🇻" },
    { name: "Arabia Saudita", flag: "🇸🇦" },
    { name: "Uruguay",        flag: "🇺🇾" },
  ],
  I: [
    { name: "Francia", flag: "🇫🇷" },
    { name: "Senegal", flag: "🇸🇳" },
    { name: "Irak",    flag: "🇮🇶" },
    { name: "Noruega", flag: "🇳🇴" },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Argelia",   flag: "🇩🇿" },
    { name: "Austria",   flag: "🇦🇹" },
    { name: "Jordania",  flag: "🇯🇴" },
  ],
  K: [
    { name: "Portugal",                       flag: "🇵🇹" },
    { name: "República Democrática del Congo", flag: "🇨🇩" },
    { name: "Uzbekistán",                     flag: "🇺🇿" },
    { name: "Colombia",                       flag: "🇨🇴" },
  ],
  L: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "Croacia",    flag: "🇭🇷" },
    { name: "Ghana",      flag: "🇬🇭" },
    { name: "Panamá",     flag: "🇵🇦" },
  ],
};

/**
 * Paleta por equipo: el color más representativo de cada selección
 * (bandera / camiseta tradicional). Cuando estás en la página de un
 * equipo concreto, esta paleta sustituye a la del grupo.
 */
// Tints muy claros (L=0.975, C=0.025-0.035) imitando los pasteles del álbum real Panini.
// Accents conservan vibrancia para ser legibles como protagonistas tipográficos.
export const TEAM_PALETTES: Record<string, { accent: string; tint: string }> = {
  // Grupo A
  "México":          { accent: "oklch(0.45 0.17 150)", tint: "oklch(0.975 0.035 150)" }, // verde
  "Sudáfrica":       { accent: "oklch(0.60 0.16 100)", tint: "oklch(0.975 0.035 100)" }, // oro-verde
  "Corea del Sur":   { accent: "oklch(0.55 0.22 25)",  tint: "oklch(0.975 0.025 25)"  }, // rojo Taegeuk
  "Chequia":         { accent: "oklch(0.45 0.18 255)", tint: "oklch(0.975 0.020 255)" }, // azul
  // Grupo B
  "Canadá":               { accent: "oklch(0.58 0.22 28)",  tint: "oklch(0.975 0.025 28)"  }, // rojo Maple
  "Qatar":                { accent: "oklch(0.40 0.18 8)",   tint: "oklch(0.970 0.025 8)"   }, // granate
  "Bosnia y Herzegovina": { accent: "oklch(0.48 0.18 250)", tint: "oklch(0.975 0.020 250)" }, // azul royal
  "Suiza":                { accent: "oklch(0.48 0.20 25)",  tint: "oklch(0.975 0.025 25)"  }, // rojo profundo
  // Grupo C
  "Brasil":    { accent: "oklch(0.55 0.18 145)", tint: "oklch(0.975 0.035 145)" }, // verde-amarela
  "Marruecos": { accent: "oklch(0.45 0.18 22)",  tint: "oklch(0.975 0.025 22)"  }, // rojo Marruecos
  "Haití":     { accent: "oklch(0.55 0.20 235)", tint: "oklch(0.975 0.025 235)" }, // azul cielo
  "Escocia":   { accent: "oklch(0.42 0.16 265)", tint: "oklch(0.975 0.020 265)" }, // azul navy
  // Grupo D
  "Estados Unidos": { accent: "oklch(0.40 0.16 265)", tint: "oklch(0.970 0.020 265)" }, // azul navy
  "Paraguay":       { accent: "oklch(0.55 0.22 28)",  tint: "oklch(0.975 0.030 28)"  }, // rojo
  "Australia":      { accent: "oklch(0.70 0.18 95)",  tint: "oklch(0.975 0.040 95)"  }, // oro Socceroos
  "Turquía":        { accent: "oklch(0.52 0.22 18)",  tint: "oklch(0.975 0.030 18)"  }, // rojo turco
  // Grupo E
  "Alemania":        { accent: "oklch(0.52 0.22 30)",  tint: "oklch(0.975 0.030 30)"  }, // rojo
  "Curazao":         { accent: "oklch(0.48 0.18 245)", tint: "oklch(0.975 0.020 245)" }, // azul
  "Costa de Marfil": { accent: "oklch(0.62 0.18 50)",  tint: "oklch(0.975 0.035 50)"  }, // naranja
  "Ecuador":         { accent: "oklch(0.70 0.18 90)",  tint: "oklch(0.975 0.040 90)"  }, // amarillo
  // Grupo F
  "Países Bajos": { accent: "oklch(0.65 0.20 50)", tint: "oklch(0.975 0.035 50)" }, // naranja Oranje
  "Japón":        { accent: "oklch(0.55 0.22 22)", tint: "oklch(0.975 0.030 22)" }, // rojo sol
  "Suecia":       { accent: "oklch(0.65 0.18 95)", tint: "oklch(0.975 0.040 95)" }, // amarillo
  "Túnez":        { accent: "oklch(0.45 0.20 22)", tint: "oklch(0.975 0.025 22)" }, // rojo Túnez
  // Grupo G
  "Bélgica":       { accent: "oklch(0.70 0.16 95)",  tint: "oklch(0.975 0.040 95)"  }, // amarillo Diablos
  "Egipto":        { accent: "oklch(0.50 0.20 28)",  tint: "oklch(0.975 0.025 28)"  }, // rojo
  "Irán":          { accent: "oklch(0.42 0.16 145)", tint: "oklch(0.975 0.030 145)" }, // verde
  "Nueva Zelanda": { accent: "oklch(0.28 0.02 270)", tint: "oklch(0.965 0.005 270)" }, // negro All Whites
  // Grupo H
  "España":         { accent: "oklch(0.52 0.22 26)",  tint: "oklch(0.975 0.025 26)"  }, // rojo Roja
  "Cabo Verde":     { accent: "oklch(0.48 0.18 250)", tint: "oklch(0.975 0.020 250)" }, // azul
  "Arabia Saudita": { accent: "oklch(0.45 0.16 150)", tint: "oklch(0.975 0.030 150)" }, // verde Halcones
  "Uruguay":        { accent: "oklch(0.65 0.16 235)", tint: "oklch(0.975 0.025 235)" }, // celeste
  // Grupo I
  "Francia": { accent: "oklch(0.42 0.18 260)", tint: "oklch(0.975 0.020 260)" }, // azul Bleus
  "Senegal": { accent: "oklch(0.48 0.16 150)", tint: "oklch(0.975 0.030 150)" }, // verde Leones
  "Irak":    { accent: "oklch(0.40 0.18 22)",  tint: "oklch(0.975 0.025 22)"  }, // rojo
  "Noruega": { accent: "oklch(0.55 0.22 28)",  tint: "oklch(0.975 0.025 28)"  }, // rojo
  // Grupo J
  "Argentina": { accent: "oklch(0.68 0.16 230)", tint: "oklch(0.975 0.030 230)" }, // celeste Albiceleste
  "Argelia":   { accent: "oklch(0.45 0.18 150)", tint: "oklch(0.975 0.030 150)" }, // verde Fennecs
  "Austria":   { accent: "oklch(0.52 0.22 25)",  tint: "oklch(0.975 0.025 25)"  }, // rojo
  "Jordania":  { accent: "oklch(0.30 0.02 0)",   tint: "oklch(0.965 0.005 0)"   }, // negro
  // Grupo K
  "Portugal":                        { accent: "oklch(0.42 0.18 25)",  tint: "oklch(0.975 0.025 25)"  }, // rojo Portugal
  "República Democrática del Congo": { accent: "oklch(0.62 0.16 90)",  tint: "oklch(0.975 0.035 90)"  }, // amarillo (Leopardos)
  "Uzbekistán":                      { accent: "oklch(0.50 0.18 245)", tint: "oklch(0.975 0.020 245)" }, // azul
  "Colombia":                        { accent: "oklch(0.75 0.17 92)",  tint: "oklch(0.975 0.045 92)"  }, // amarillo Tricolor
  // Grupo L
  "Inglaterra": { accent: "oklch(0.50 0.22 25)",  tint: "oklch(0.975 0.025 25)"  }, // rojo Three Lions
  "Croacia":    { accent: "oklch(0.45 0.22 18)",  tint: "oklch(0.975 0.025 18)"  }, // rojo Vatreni
  "Ghana":      { accent: "oklch(0.65 0.18 88)",  tint: "oklch(0.975 0.040 88)"  }, // amarillo Black Star
  "Panamá":     { accent: "oklch(0.45 0.20 250)", tint: "oklch(0.975 0.020 250)" }, // azul
};

/** Devuelve la "section key" para una sticker según group_code/page */
export function sectionKey(
  groupCode: string | null,
  page: number | null,
): GroupCode | SpecialKey | "other" {
  if (groupCode) return groupCode.toUpperCase() as GroupCode;
  const p = page ?? 0;
  if (p < 100) return "apertura";
  if (p < 110) return "historia";
  if (p < 120) return "coca-cola";
  return "other";
}

/** Orden de las 15 secciones para el índice */
export const SECTION_ORDER: Array<GroupCode | SpecialKey> = [
  "apertura",
  ...GROUP_CODES,
  "historia",
  "coca-cola",
];

export function sectionHref(key: GroupCode | SpecialKey): string {
  if (key === "apertura") return "/album/apertura";
  if (key === "historia") return "/album/historia";
  if (key === "coca-cola") return "/album/coca-cola";
  return `/album/grupo/${key.toLowerCase()}`;
}

export function sectionLabel(key: GroupCode | SpecialKey): string {
  if (key in SPECIAL_SECTIONS) return SPECIAL_SECTIONS[key as SpecialKey].label;
  return `Grupo ${key}`;
}

export function sectionPalette(key: GroupCode | SpecialKey): {
  accent: string;
  tint: string;
} {
  if (key in SPECIAL_SECTIONS) {
    const s = SPECIAL_SECTIONS[key as SpecialKey];
    return { accent: s.accent, tint: s.tint };
  }
  return GROUP_PALETTES[key as GroupCode];
}
