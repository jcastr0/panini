/**
 * Paleta y metadatos del álbum del Mundial 2026.
 * Una sola fuente de verdad para identidad visual por grupo/sección.
 */

export type GroupCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export const GROUP_CODES: GroupCode[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export const GROUP_PALETTES: Record<
  GroupCode,
  { accent: string; tint: string; tag: string }
> = {
  A: { accent: "oklch(0.62 0.20 28)",  tint: "oklch(0.96 0.04 50)",  tag: "Anfitriones" },
  B: { accent: "oklch(0.60 0.16 235)", tint: "oklch(0.96 0.025 230)", tag: "Norte" },
  C: { accent: "oklch(0.55 0.18 155)", tint: "oklch(0.96 0.04 155)", tag: "Tropical" },
  D: { accent: "oklch(0.52 0.20 280)", tint: "oklch(0.95 0.04 290)", tag: "Pacífico" },
  E: { accent: "oklch(0.65 0.18 85)",  tint: "oklch(0.96 0.05 90)",  tag: "Centro" },
  F: { accent: "oklch(0.65 0.18 20)",  tint: "oklch(0.95 0.04 20)",  tag: "Oriente" },
  G: { accent: "oklch(0.60 0.15 200)", tint: "oklch(0.96 0.03 200)", tag: "Mediterráneo" },
  H: { accent: "oklch(0.68 0.18 60)",  tint: "oklch(0.95 0.05 70)",  tag: "Ibérica" },
  I: { accent: "oklch(0.55 0.22 340)", tint: "oklch(0.95 0.04 340)", tag: "Europa" },
  J: { accent: "oklch(0.50 0.18 260)", tint: "oklch(0.95 0.04 260)", tag: "Atlántico" },
  K: { accent: "oklch(0.55 0.18 130)", tint: "oklch(0.96 0.05 135)", tag: "Lusófono" },
  L: { accent: "oklch(0.55 0.20 5)",   tint: "oklch(0.95 0.04 10)",  tag: "Británico" },
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
    { name: "México",          flag: "🇲🇽" },
    { name: "Sudáfrica",       flag: "🇿🇦" },
    { name: "Corea del Sur",   flag: "🇰🇷" },
    { name: "República Checa", flag: "🇨🇿" },
  ],
  B: [
    { name: "Canadá",               flag: "🇨🇦" },
    { name: "Qatar",                flag: "🇶🇦" },
    { name: "Bosnia y Herzegovina", flag: "🇧🇦" },
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
