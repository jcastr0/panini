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

export type SpecialKey = "apertura" | "historia" | "coca-cola" | "legends";

export const SPECIAL_SECTIONS: Record<
  SpecialKey,
  { accent: string; tint: string; label: string; emoji: string }
> = {
  apertura:    { accent: "var(--panini-blue)", tint: "oklch(0.96 0.02 250)", label: "Apertura",    emoji: "🎉" },
  historia:    { accent: "var(--gold)",       tint: "oklch(0.96 0.05 85)",  label: "Historia",    emoji: "🏆" },
  legends:     { accent: "var(--gold)",       tint: "oklch(0.97 0.06 88)",  label: "Legends",     emoji: "⭐" },
  "coca-cola": { accent: "var(--panini-red)", tint: "oklch(0.96 0.04 25)",  label: "Coca-Cola",   emoji: "⭐" },
};

export type Confederation =
  | "CONMEBOL"
  | "UEFA"
  | "CONCACAF"
  | "CAF"
  | "AFC"
  | "OFC";

export type TeamInfo = {
  /** Nombre en español, mismo que en stickers.team */
  name: string;
  /** Bandera emoji para listas compactas y tabs */
  flag: string;
  /** ISO 3166-1 alpha-2 minúsculas — para clases `fi fi-{iso}` de flag-icons.
      Subdivisiones GB-* (Escocia / Inglaterra) usan formato lipis: "gb-sct", "gb-eng". */
  iso: string;
  /** Código Panini de 3 letras (FIFA): MEX, RSA, KOR, BIH... — prefijo del sticker code */
  paniniCode: string;
  /** Nombre en inglés para el "WE ARE, {ENGLISH}" del header del país */
  englishName: string;
  /** Acrónimo de la federación nacional (para chip compacto) */
  federation: string;
  /** Nombre completo de la federación, como en la portada Panini */
  federationName: string;
  confederation: Confederation;
};

/** Equipos por grupo — coincide con stickers.team del seed real.
 *  paniniCode = código FIFA de 3 letras impreso en el cromo (MEX1, RSA1...).
 *  federationName = nombre oficial completo, como aparece en la portada del álbum.
 */
export const GROUP_TEAMS: Record<GroupCode, TeamInfo[]> = {
  A: [
    { name: "México",        flag: "🇲🇽", iso: "mx", paniniCode: "MEX", englishName: "Mexico",       federation: "FMF",  federationName: "Federación Mexicana de Fútbol Asociación",  confederation: "CONCACAF" },
    { name: "Sudáfrica",     flag: "🇿🇦", iso: "za", paniniCode: "RSA", englishName: "South Africa", federation: "SAFA", federationName: "South African Football Association",        confederation: "CAF"      },
    { name: "Corea del Sur", flag: "🇰🇷", iso: "kr", paniniCode: "KOR", englishName: "South Korea",  federation: "KFA",  federationName: "Korea Football Association",                confederation: "AFC"      },
    { name: "Chequia",       flag: "🇨🇿", iso: "cz", paniniCode: "CZE", englishName: "Czechia",      federation: "FAČR", federationName: "Football Association of the Czech Republic", confederation: "UEFA"   },
  ],
  B: [
    { name: "Canadá",               flag: "🇨🇦", iso: "ca", paniniCode: "CAN", englishName: "Canada",                 federation: "CSA",   federationName: "Canadian Soccer Association",                   confederation: "CONCACAF" },
    { name: "Bosnia y Herzegovina", flag: "🇧🇦", iso: "ba", paniniCode: "BIH", englishName: "Bosnia and Herzegovina", federation: "NSBiH", federationName: "Football Association of Bosnia and Herzegovina", confederation: "UEFA"     },
    { name: "Qatar",                flag: "🇶🇦", iso: "qa", paniniCode: "QAT", englishName: "Qatar",                  federation: "QFA",   federationName: "Qatar Football Association",                    confederation: "AFC"      },
    { name: "Suiza",                flag: "🇨🇭", iso: "ch", paniniCode: "SUI", englishName: "Switzerland",            federation: "SFV",   federationName: "Swiss Football Association",                    confederation: "UEFA"     },
  ],
  C: [
    { name: "Brasil",    flag: "🇧🇷",          iso: "br",     paniniCode: "BRA", englishName: "Brazil",   federation: "CBF",  federationName: "Confederação Brasileira de Futebol",  confederation: "CONMEBOL" },
    { name: "Marruecos", flag: "🇲🇦",          iso: "ma",     paniniCode: "MAR", englishName: "Morocco",  federation: "FRMF", federationName: "Fédération Royale Marocaine de Football", confederation: "CAF"  },
    { name: "Haití",     flag: "🇭🇹",          iso: "ht",     paniniCode: "HAI", englishName: "Haiti",    federation: "FHF",  federationName: "Fédération Haïtienne de Football",    confederation: "CONCACAF" },
    { name: "Escocia",   flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso: "gb-sct", paniniCode: "SCO", englishName: "Scotland", federation: "SFA",  federationName: "Scottish Football Association",       confederation: "UEFA"     },
  ],
  D: [
    { name: "Estados Unidos", flag: "🇺🇸", iso: "us", paniniCode: "USA", englishName: "United States", federation: "USSF", federationName: "United States Soccer Federation", confederation: "CONCACAF" },
    { name: "Paraguay",       flag: "🇵🇾", iso: "py", paniniCode: "PAR", englishName: "Paraguay",      federation: "APF",  federationName: "Asociación Paraguaya de Fútbol",  confederation: "CONMEBOL" },
    { name: "Australia",      flag: "🇦🇺", iso: "au", paniniCode: "AUS", englishName: "Australia",     federation: "FA",   federationName: "Football Australia",              confederation: "AFC"      },
    { name: "Turquía",        flag: "🇹🇷", iso: "tr", paniniCode: "TUR", englishName: "Türkiye",       federation: "TFF",  federationName: "Türkiye Futbol Federasyonu",      confederation: "UEFA"     },
  ],
  E: [
    { name: "Alemania",        flag: "🇩🇪", iso: "de", paniniCode: "GER", englishName: "Germany",       federation: "DFB", federationName: "Deutscher Fußball-Bund",            confederation: "UEFA"     },
    { name: "Curazao",         flag: "🇨🇼", iso: "cw", paniniCode: "CUW", englishName: "Curaçao",       federation: "FFK", federationName: "Federashon Futbol Kòrsou",          confederation: "CONCACAF" },
    { name: "Costa de Marfil", flag: "🇨🇮", iso: "ci", paniniCode: "CIV", englishName: "Côte d'Ivoire", federation: "FIF", federationName: "Fédération Ivoirienne de Football", confederation: "CAF"      },
    { name: "Ecuador",         flag: "🇪🇨", iso: "ec", paniniCode: "ECU", englishName: "Ecuador",       federation: "FEF", federationName: "Federación Ecuatoriana de Fútbol",  confederation: "CONMEBOL" },
  ],
  F: [
    { name: "Países Bajos", flag: "🇳🇱", iso: "nl", paniniCode: "NED", englishName: "Netherlands", federation: "KNVB", federationName: "Koninklijke Nederlandse Voetbalbond", confederation: "UEFA" },
    { name: "Japón",        flag: "🇯🇵", iso: "jp", paniniCode: "JPN", englishName: "Japan",       federation: "JFA",  federationName: "Japan Football Association",         confederation: "AFC"  },
    { name: "Suecia",       flag: "🇸🇪", iso: "se", paniniCode: "SWE", englishName: "Sweden",      federation: "SvFF", federationName: "Svenska Fotbollförbundet",            confederation: "UEFA" },
    { name: "Túnez",        flag: "🇹🇳", iso: "tn", paniniCode: "TUN", englishName: "Tunisia",     federation: "FTF",  federationName: "Fédération Tunisienne de Football",   confederation: "CAF"  },
  ],
  G: [
    { name: "Bélgica",       flag: "🇧🇪", iso: "be", paniniCode: "BEL", englishName: "Belgium",     federation: "KBVB",  federationName: "Royal Belgian Football Association",          confederation: "UEFA" },
    { name: "Egipto",        flag: "🇪🇬", iso: "eg", paniniCode: "EGY", englishName: "Egypt",       federation: "EFA",   federationName: "Egyptian Football Association",               confederation: "CAF"  },
    { name: "Irán",          flag: "🇮🇷", iso: "ir", paniniCode: "IRN", englishName: "Iran",        federation: "FFIRI", federationName: "Football Federation Islamic Republic of Iran", confederation: "AFC" },
    { name: "Nueva Zelanda", flag: "🇳🇿", iso: "nz", paniniCode: "NZL", englishName: "New Zealand", federation: "NZF",   federationName: "New Zealand Football",                        confederation: "OFC"  },
  ],
  H: [
    { name: "España",         flag: "🇪🇸", iso: "es", paniniCode: "ESP", englishName: "Spain",        federation: "RFEF", federationName: "Real Federación Española de Fútbol",  confederation: "UEFA"     },
    { name: "Cabo Verde",     flag: "🇨🇻", iso: "cv", paniniCode: "CPV", englishName: "Cape Verde",   federation: "FCF",  federationName: "Federação Caboverdiana de Futebol",   confederation: "CAF"      },
    { name: "Arabia Saudita", flag: "🇸🇦", iso: "sa", paniniCode: "KSA", englishName: "Saudi Arabia", federation: "SAFF", federationName: "Saudi Arabian Football Federation",   confederation: "AFC"      },
    { name: "Uruguay",        flag: "🇺🇾", iso: "uy", paniniCode: "URU", englishName: "Uruguay",      federation: "AUF",  federationName: "Asociación Uruguaya de Fútbol",       confederation: "CONMEBOL" },
  ],
  I: [
    { name: "Francia", flag: "🇫🇷", iso: "fr", paniniCode: "FRA", englishName: "France",  federation: "FFF", federationName: "Fédération Française de Football", confederation: "UEFA" },
    { name: "Senegal", flag: "🇸🇳", iso: "sn", paniniCode: "SEN", englishName: "Senegal", federation: "FSF", federationName: "Fédération Sénégalaise de Football", confederation: "CAF" },
    { name: "Irak",    flag: "🇮🇶", iso: "iq", paniniCode: "IRQ", englishName: "Iraq",    federation: "IFA", federationName: "Iraq Football Association",        confederation: "AFC"  },
    { name: "Noruega", flag: "🇳🇴", iso: "no", paniniCode: "NOR", englishName: "Norway",  federation: "NFF", federationName: "Norges Fotballforbund",             confederation: "UEFA" },
  ],
  J: [
    { name: "Argentina", flag: "🇦🇷", iso: "ar", paniniCode: "ARG", englishName: "Argentina", federation: "AFA", federationName: "Asociación del Fútbol Argentino", confederation: "CONMEBOL" },
    { name: "Argelia",   flag: "🇩🇿", iso: "dz", paniniCode: "ALG", englishName: "Algeria",   federation: "FAF", federationName: "Fédération Algérienne de Football", confederation: "CAF"     },
    { name: "Austria",   flag: "🇦🇹", iso: "at", paniniCode: "AUT", englishName: "Austria",   federation: "ÖFB", federationName: "Österreichischer Fußball-Bund",    confederation: "UEFA"     },
    { name: "Jordania",  flag: "🇯🇴", iso: "jo", paniniCode: "JOR", englishName: "Jordan",    federation: "JFA", federationName: "Jordan Football Association",      confederation: "AFC"      },
  ],
  K: [
    { name: "Portugal",                        flag: "🇵🇹", iso: "pt", paniniCode: "POR", englishName: "Portugal",     federation: "FPF",    federationName: "Federação Portuguesa de Futebol",            confederation: "UEFA"     },
    { name: "República Democrática del Congo", flag: "🇨🇩", iso: "cd", paniniCode: "COD", englishName: "DR Congo",     federation: "FECOFA", federationName: "Fédération Congolaise de Football-Association", confederation: "CAF"   },
    { name: "Uzbekistán",                      flag: "🇺🇿", iso: "uz", paniniCode: "UZB", englishName: "Uzbekistan",   federation: "UFA",    federationName: "Uzbekistan Football Association",            confederation: "AFC"      },
    { name: "Colombia",                        flag: "🇨🇴", iso: "co", paniniCode: "COL", englishName: "Colombia",     federation: "FCF",    federationName: "Federación Colombiana de Fútbol",            confederation: "CONMEBOL" },
  ],
  L: [
    { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", iso: "gb-eng", paniniCode: "ENG", englishName: "England", federation: "FA",      federationName: "The Football Association",         confederation: "UEFA"     },
    { name: "Croacia",    flag: "🇭🇷",          iso: "hr",     paniniCode: "CRO", englishName: "Croatia", federation: "HNS",     federationName: "Croatian Football Federation",     confederation: "UEFA"     },
    { name: "Ghana",      flag: "🇬🇭",          iso: "gh",     paniniCode: "GHA", englishName: "Ghana",   federation: "GFA",     federationName: "Ghana Football Association",       confederation: "CAF"      },
    { name: "Panamá",     flag: "🇵🇦",          iso: "pa",     paniniCode: "PAN", englishName: "Panama",  federation: "FEPAFUT", federationName: "Federación Panameña de Fútbol",    confederation: "CONCACAF" },
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

/** Devuelve la "section key" para una sticker según group_code/page/type */
export function sectionKey(
  groupCode: string | null,
  page: number | null,
  type?: string | null,
): GroupCode | SpecialKey | "other" {
  if (groupCode) return groupCode.toUpperCase() as GroupCode;
  if (type === "legend") return "legends";
  const p = page ?? 0;
  if (p < 100) return "apertura";
  if (p < 110) return "historia";
  if (p < 120) return "coca-cola";
  return "other";
}

/** Orden de las 16 secciones para el índice */
export const SECTION_ORDER: Array<GroupCode | SpecialKey> = [
  "apertura",
  ...GROUP_CODES,
  "historia",
  "legends",
  "coca-cola",
];

export function sectionHref(key: GroupCode | SpecialKey): string {
  if (key === "apertura") return "/album/apertura";
  if (key === "historia") return "/album/historia";
  if (key === "legends") return "/album/legends";
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
