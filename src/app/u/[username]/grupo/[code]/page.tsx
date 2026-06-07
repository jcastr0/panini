import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getStickersByGroup,
  paginate,
} from "@/lib/queries";
import {
  GROUP_CODES,
  GROUP_PALETTES,
  GROUP_TEAMS,
  TEAM_PALETTES,
  type GroupCode,
} from "@/lib/album-config";
import { SectionHero } from "@/app/(app)/album/_components/section-hero";
import {
  TeamBlock,
  type SectionSticker,
} from "@/app/(app)/album/_components/team-block";

const VALID_CODES = new Set(GROUP_CODES.map((c) => c.toLowerCase()));

export default async function PublicGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; code: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { username, code: codeParam } = await params;
  const { p } = await searchParams;

  if (!VALID_CODES.has(codeParam.toLowerCase())) notFound();
  const code = codeParam.toUpperCase() as GroupCode;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, collector_card_base64, is_public_profile")
    .eq("username", username)
    .maybeSingle();
  if (!profile || !profile.is_public_profile) notFound();

  const ownerProps = {
    username: profile.username,
    displayName: profile.display_name ?? null,
    collectorCardBase64: profile.collector_card_base64 ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickers, { data: ownedRows }] = await Promise.all([
    getStickersByGroup(album.id, code),
    paginate<{
      sticker_id: string;
      quantity: number;
      display_variant: "normal" | "legend" | null;
    }>((from, to) =>
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity, display_variant")
        .eq("user_id", profile.id)
        .range(from, to),
    ).then((data) => ({ data })),
  ]);

  const qtyMap = new Map<string, number>();
  const variantMap = new Map<string, "normal" | "legend" | null>();
  (ownedRows ?? []).forEach((r) => {
    qtyMap.set(r.sticker_id, r.quantity ?? 0);
    variantMap.set(r.sticker_id, (r.display_variant as "normal" | "legend" | null) ?? null);
  });

  // Enriquecer cada sticker con info de su legend (si la tiene). El JOIN
  // inverso devuelve `legend` como array (PostgREST embedded resource).
  type StickerWithLegend = SectionSticker & {
    legend?: Array<{ id: string; code: string }> | { id: string; code: string } | null;
  };
  const enriched: SectionSticker[] = (stickers as unknown as StickerWithLegend[]).map((s) => {
    const legend = Array.isArray(s.legend) ? s.legend[0] ?? null : s.legend ?? null;
    const legendId = legend?.id ?? null;
    const { legend: _legend, ...rest } = s;
    return {
      ...rest,
      legendStickerId: legendId,
      legendCode: legend?.code ?? null,
      hasLegend: legendId ? (qtyMap.get(legendId) ?? 0) >= 1 : false,
      displayVariant: variantMap.get(s.id) ?? null,
    };
  });

  // Map de qty para legends (renderQty cuando effectiveVariant='legend')
  const legendQtyMap = new Map<string, number>();
  enriched.forEach((s) => {
    if (s.legendStickerId) {
      legendQtyMap.set(s.legendStickerId, qtyMap.get(s.legendStickerId) ?? 0);
    }
  });

  const flags = GROUP_TEAMS[code];
  const byTeam = new Map<string, SectionSticker[]>();
  enriched.forEach((s) => {
    const key = s.team ?? "";
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key)!.push(s);
  });
  const orderedTeams = flags
    .map((info) => ({ info, list: byTeam.get(info.name) ?? [] }))
    .filter((t) => t.list.length > 0);

  const totalTeams = orderedTeams.length;
  const requested = Math.max(1, Math.min(totalTeams, Number(p) || 1));
  const teamIndex = requested - 1;
  const currentTeam = orderedTeams[teamIndex];
  if (!currentTeam) notFound();

  const palette =
    TEAM_PALETTES[currentTeam.info.name] ?? GROUP_PALETTES[code];

  const groupTotal = enriched.length;
  const groupOwned = enriched.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;
  const groupPercent =
    groupTotal > 0 ? Math.round((groupOwned / groupTotal) * 100) : 0;

  const idx = GROUP_CODES.indexOf(code);
  const prevHref =
    requested > 1
      ? `/u/${username}/grupo/${code.toLowerCase()}?p=${requested - 1}`
      : idx > 0
        ? `/u/${username}/grupo/${GROUP_CODES[idx - 1].toLowerCase()}?p=${
            GROUP_TEAMS[GROUP_CODES[idx - 1]].length
          }`
        : `/u/${username}/apertura`;
  const nextHref =
    requested < totalTeams
      ? `/u/${username}/grupo/${code.toLowerCase()}?p=${requested + 1}`
      : idx < GROUP_CODES.length - 1
        ? `/u/${username}/grupo/${GROUP_CODES[idx + 1].toLowerCase()}?p=1`
        : `/u/${username}/historia`;

  const ownerDisplay = profile.display_name ?? `@${profile.username}`;

  return (
    <div
      className="space-y-8"
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
        badge={`Álbum de @${profile.username}`}
        letter={code}
        subtitle={`Grupo ${code} · ${GROUP_PALETTES[code].tag}`}
        owned={groupOwned}
        total={groupTotal}
        ownerProps={ownerProps}
        backHref={`/u/${username}`}
        backLabel={`Perfil de ${ownerDisplay}`}
        nextHref={
          idx < GROUP_CODES.length - 1
            ? `/u/${username}/grupo/${GROUP_CODES[idx + 1].toLowerCase()}?p=1`
            : `/u/${username}/historia`
        }
        nextLabel={
          idx < GROUP_CODES.length - 1
            ? `Grupo ${GROUP_CODES[idx + 1]}`
            : "Historia"
        }
      />

      <nav
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        aria-label="Equipos"
      >
        {orderedTeams.map((t, i) => {
          const ownedInTeam = t.list.filter(
            (s) => (qtyMap.get(s.id) ?? 0) >= 1,
          ).length;
          const active = i === teamIndex;
          const tPalette = TEAM_PALETTES[t.info.name] ?? GROUP_PALETTES[code];
          return (
            <Link
              key={t.info.name}
              href={`/u/${username}/grupo/${code.toLowerCase()}?p=${i + 1}`}
              className="rounded-xl border p-3 transition-all hover:-translate-y-0.5 relative overflow-hidden"
              style={
                active
                  ? {
                      backgroundColor: tPalette.tint,
                      borderColor: tPalette.accent,
                    }
                  : undefined
              }
              aria-current={active ? "page" : undefined}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: tPalette.accent }}
              />
              <div className="flex items-center gap-2 pl-1.5">
                <span className="text-2xl">{t.info.flag}</span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold truncate"
                    style={active ? { color: tPalette.accent } : undefined}
                  >
                    {t.info.name}
                  </div>
                  <div className="text-xs font-mono tabular text-muted-foreground">
                    {ownedInTeam}/{t.list.length}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      <TeamBlock
        teamName={currentTeam.info.name}
        teamFlag={currentTeam.info.flag}
        teamInfo={currentTeam.info}
        list={currentTeam.list}
        qtyMap={qtyMap}
        groupCode={code}
        groupFlags={flags.map((f) => ({ name: f.name, flag: f.flag }))}
        tint={palette.tint}
        accent={palette.accent}
        readOnly
        legendQtyMap={legendQtyMap}
      />

      <p className="text-xs text-muted-foreground italic text-center">
        Vista de solo lectura · estás viendo el álbum de @{profile.username}.
      </p>

      <nav className="border-t pt-6 flex items-center justify-between gap-3">
        <Link
          href={prevHref}
          className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-4" /> Anterior
        </Link>
        <Link
          href={`/u/${username}`}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
        >
          Volver al perfil
        </Link>
        <Link
          href={nextHref}
          className="inline-flex items-center gap-2 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
        >
          Siguiente <ChevronRight className="size-4" />
        </Link>
      </nav>
    </div>
  );
}
