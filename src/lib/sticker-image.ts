/**
 * URL de la lámina real para un código de cromo.
 *  - Equipos (3 letras + número): MEX1 → /laminas/MEX/mex1.jpg
 *  - Legends:                     LEGARG17 → /laminas/LEG/legarg17.jpg
 *  - Coca-Cola (CC + número):     CC1 → /cocacola/cc1.jpg
 *  - Apertura/Historia (FWC):     FWC9 → /laminas/FWC/fwc9.jpg
 *  - Cromo "00" (Logo Panini):    "00" → /laminas/FWC/fwc00.jpg
 *
 * Sin owned check — quien lo llama decide si quiere bloquear según contexto
 * (en el álbum se bloquea por no-spoiler; en trades siempre mostramos).
 */
export function stickerImagePath(code: string | null | undefined): string | null {
  if (!code) return null;
  const legMatch = code.match(/^LEG([A-Z]{3})(\d+)$/);
  if (legMatch) {
    const [, team, n] = legMatch;
    return `/laminas/LEG/leg${team.toLowerCase()}${n}.jpg`;
  }
  const teamMatch = code.match(/^([A-Z]{3})(\d+)$/);
  if (teamMatch) {
    const [, prefix, n] = teamMatch;
    return `/laminas/${prefix}/${prefix.toLowerCase()}${n}.jpg`;
  }
  const ccMatch = code.match(/^CC(\d{1,2})$/);
  if (ccMatch) {
    return `/cocacola/cc${ccMatch[1]}.jpg`;
  }
  const numMatch = code.match(/^(\d+)$/);
  if (numMatch) {
    return `/laminas/FWC/fwc${numMatch[1]}.jpg`;
  }
  return null;
}
