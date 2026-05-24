import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getStickersByGroup,
} from "@/lib/queries";
import {
  GROUP_CODES,
  GROUP_PALETTES,
  GROUP_TEAMS,
  sectionHref,
  sectionLabel,
  type GroupCode,
} from "@/lib/album-config";
import {
  SectionFooterNav,
  SectionHero,
} from "../../_components/section-hero";
import {
  TeamBlock,
  type SectionSticker,
} from "../../_components/team-block";

const VALID_CODES = new Set(GROUP_CODES.map((c) => c.toLowerCase()));

export default async function GroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: codeParam } = await params;
  if (!VALID_CODES.has(codeParam.toLowerCase())) notFound();
  const code = codeParam.toUpperCase() as GroupCode;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, ownedRows, collectorCard] = await Promise.all([
    getStickersByGroup(album.id, code),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id),
    getCollectorCard(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  (ownedRows.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  const palette = GROUP_PALETTES[code];
  const flags = GROUP_TEAMS[code];

  // Agrupar por equipo
  const byTeam = new Map<string, SectionSticker[]>();
  stickers.forEach((s) => {
    const key = s.team ?? "";
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key)!.push(s as SectionSticker);
  });
  const teams = [...byTeam.entries()];

  const total = stickers.length;
  const owned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;

  const ownerProps = {
    username: collectorCard?.username ?? "",
    displayName: collectorCard?.display_name ?? null,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };

  // Prev / next entre las 15 secciones (apertura → A..L → historia → coca-cola)
  const idx = GROUP_CODES.indexOf(code);
  const prev =
    idx > 0
      ? { href: sectionHref(GROUP_CODES[idx - 1]), label: sectionLabel(GROUP_CODES[idx - 1]) }
      : { href: sectionHref("apertura"), label: sectionLabel("apertura") };
  const next =
    idx < GROUP_CODES.length - 1
      ? { href: sectionHref(GROUP_CODES[idx + 1]), label: sectionLabel(GROUP_CODES[idx + 1]) }
      : { href: sectionHref("historia"), label: sectionLabel("historia") };

  return (
    <div
      className="space-y-10"
      style={
        {
          "--accent-section": palette.accent,
          "--tint-section": palette.tint,
        } as React.CSSProperties
      }
    >
      <SectionHero
        accent={palette.accent}
        tint={palette.tint}
        badge={`Grupo · ${palette.tag}`}
        letter={code}
        subtitle={`${flags.map((f) => f.name).join(" · ")}`}
        flags={flags}
        owned={owned}
        total={total}
        ownerProps={ownerProps}
      />

      <div className="space-y-10">
        {teams.map(([teamName, list]) => {
          const flag = flags.find((t) => t.name === teamName)?.flag;
          return (
            <TeamBlock
              key={teamName}
              teamName={teamName}
              teamFlag={flag}
              list={list}
              qtyMap={qtyMap}
            />
          );
        })}
      </div>

      <SectionFooterNav prev={prev} next={next} />
    </div>
  );
}
