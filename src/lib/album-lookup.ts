import { GROUP_TEAMS, type GroupCode } from "@/lib/album-config";

export type StickerHit = {
  code: string;
  team: string | null;
  group_code: string | null;
  type: string;
  page: number | null;
  name: string;
  url: string;
};

/**
 * Construye la URL del cromo en el álbum (con anchor para scroll).
 * - Equipos: /album/grupo/{a}?p={N}#{CODE}
 * - Apertura: /album/apertura#{CODE}
 * - Historia: /album/historia#{CODE}
 * - Legends: /album/legends#{CODE}
 * - Coca-Cola: /album/coca-cola#{CODE}
 */
export function buildStickerUrl(s: {
  code: string | null;
  team: string | null;
  group_code: string | null;
  type: string;
  page: number | null;
}): string {
  const code = (s.code ?? "").toUpperCase();
  const anchor = code ? `#${code}` : "";

  if (s.type === "legend") {
    return `/album/legends${anchor}`;
  }
  if (s.group_code) {
    const teams = GROUP_TEAMS[s.group_code.toUpperCase() as GroupCode] ?? [];
    const idx = teams.findIndex((t) => t.name === s.team);
    const p = idx >= 0 ? idx + 1 : 1;
    return `/album/grupo/${s.group_code.toLowerCase()}?p=${p}${anchor}`;
  }
  if (code.startsWith("CC")) {
    return `/album/coca-cola${anchor}`;
  }
  // Códigos numéricos puros — apertura (0-3) o historia (>= 100)
  const p = s.page ?? 0;
  if (p < 100) return `/album/apertura${anchor}`;
  return `/album/historia${anchor}`;
}
