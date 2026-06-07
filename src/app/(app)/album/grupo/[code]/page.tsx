import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getStickersByGroup,
  paginate,
} from "@/lib/queries";
import {
  GROUP_CODES,
  GROUP_PALETTES,
  GROUP_TEAMS,
  TEAM_PALETTES,
  sectionHref,
  sectionLabel,
  type GroupCode,
} from "@/lib/album-config";
import { SectionHero } from "../../_components/section-hero";
import {
  TeamBlock,
  type SectionSticker,
} from "../../_components/team-block";

const VALID_CODES = new Set(GROUP_CODES.map((c) => c.toLowerCase()));

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { code: codeParam } = await params;
  const { p } = await searchParams;
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
    paginate<{
      sticker_id: string;
      quantity: number;
      display_variant: "normal" | "legend" | null;
    }>((from, to) =>
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity, display_variant")
        .eq("user_id", user.id)
        .range(from, to),
    ).then((data) => ({ data })),
    getCollectorCard(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  const variantMap = new Map<string, "normal" | "legend" | null>();
  (ownedRows.data ?? []).forEach((r) => {
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

  const groupPalette = GROUP_PALETTES[code];
  const flags = GROUP_TEAMS[code];

  // Agrupar por equipo respetando el orden de GROUP_TEAMS
  const byTeam = new Map<string, SectionSticker[]>();
  enriched.forEach((s) => {
    const key = s.team ?? "";
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key)!.push(s);
  });
  const orderedTeams = flags
    .map((info) => ({
      name: info.name,
      flag: info.flag,
      info,
      list: byTeam.get(info.name) ?? [],
    }))
    .filter((t) => t.list.length > 0);

  const totalTeams = orderedTeams.length;
  const requested = Math.max(1, Math.min(totalTeams, Number(p) || 1));
  const teamIndex = requested - 1;
  const currentTeam = orderedTeams[teamIndex];
  if (!currentTeam) notFound();

  // Paleta activa = la del equipo si existe; si no, fallback a la del grupo.
  const palette = TEAM_PALETTES[currentTeam.name] ?? groupPalette;

  // Stats del GRUPO (protagonista del hero, con barra) + EQUIPO activo (línea menor)
  const teamOwned = currentTeam.list.filter(
    (s) => (qtyMap.get(s.id) ?? 0) >= 1,
  ).length;
  const teamTotal = currentTeam.list.length;
  const teamPercent =
    teamTotal > 0 ? Math.round((teamOwned / teamTotal) * 100) : 0;
  const groupTotal = enriched.length;
  const groupOwned = enriched.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length;

  const ownerProps = {
    username: collectorCard?.username ?? "",
    displayName: collectorCard?.display_name ?? null,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };

  // Footer nav contextual:
  //  - dentro del grupo si hay equipo anterior/siguiente
  //  - cruzar al grupo previo/siguiente cuando estás en extremos
  const idx = GROUP_CODES.indexOf(code);
  const prev =
    requested > 1
      ? {
          href: `${sectionHref(code)}?p=${requested - 1}`,
          label: orderedTeams[teamIndex - 1].name,
          icon: orderedTeams[teamIndex - 1].flag,
        }
      : idx > 0
        ? {
            href: `${sectionHref(GROUP_CODES[idx - 1])}?p=${totalTeams}`,
            label: sectionLabel(GROUP_CODES[idx - 1]),
            icon: undefined as string | undefined,
          }
        : {
            href: sectionHref("apertura"),
            label: sectionLabel("apertura"),
            icon: undefined,
          };
  const next =
    requested < totalTeams
      ? {
          href: `${sectionHref(code)}?p=${requested + 1}`,
          label: orderedTeams[teamIndex + 1].name,
          icon: orderedTeams[teamIndex + 1].flag,
        }
      : idx < GROUP_CODES.length - 1
        ? {
            href: `${sectionHref(GROUP_CODES[idx + 1])}?p=1`,
            label: sectionLabel(GROUP_CODES[idx + 1]),
            icon: undefined as string | undefined,
          }
        : {
            href: sectionHref("historia"),
            label: sectionLabel("historia"),
            icon: undefined,
          };

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
        badge={`Grupo ${code} · ${groupPalette.tag}`}
        letter={code}
        subtitle={flags.map((f) => f.name).join(" · ")}
        flags={flags}
        owned={groupOwned}
        total={groupTotal}
        context={`${currentTeam.flag} ${currentTeam.name} · ${teamOwned}/${teamTotal} · ${teamPercent}%`}
        ownerProps={ownerProps}
        nextHref={
          idx < GROUP_CODES.length - 1
            ? `${sectionHref(GROUP_CODES[idx + 1])}?p=1`
            : sectionHref("historia")
        }
        nextLabel={
          idx < GROUP_CODES.length - 1
            ? `Grupo ${GROUP_CODES[idx + 1]}`
            : "Historia"
        }
      />

      {/* Selector de equipos — cada tab usa el color del país, el activo se resalta */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Equipos">
        {orderedTeams.map((t, i) => {
          const ownedInTeam = t.list.filter(
            (s) => (qtyMap.get(s.id) ?? 0) >= 1,
          ).length;
          const active = i === teamIndex;
          const teamPalette = TEAM_PALETTES[t.name] ?? groupPalette;
          return (
            <Link
              key={t.name}
              href={`${sectionHref(code)}?p=${i + 1}`}
              className="rounded-xl border p-3 transition-all hover:-translate-y-0.5 relative overflow-hidden"
              style={
                active
                  ? {
                      backgroundColor: teamPalette.tint,
                      borderColor: teamPalette.accent,
                      boxShadow: `0 4px 14px -8px ${teamPalette.accent}88`,
                    }
                  : undefined
              }
              aria-current={active ? "page" : undefined}
            >
              {/* Banda lateral del color del equipo */}
              <span
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: teamPalette.accent }}
                aria-hidden
              />
              <div className="flex items-center gap-2 pl-1.5">
                <span className="text-2xl leading-none" aria-hidden>
                  {t.flag}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-semibold truncate"
                    style={active ? { color: teamPalette.accent } : undefined}
                  >
                    {t.name}
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

      {/* Indicador "1/4" */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono uppercase tracking-widest text-muted-foreground">
          Página {requested}/{totalTeams}
        </span>
        <span className="font-display text-base font-semibold flex items-center gap-2">
          <span className="text-2xl leading-none" aria-hidden>
            {currentTeam.flag}
          </span>
          {currentTeam.name}
        </span>
      </div>

      <TeamBlock
        teamName={currentTeam.name}
        teamFlag={currentTeam.flag}
        teamInfo={currentTeam.info}
        list={currentTeam.list}
        qtyMap={qtyMap}
        groupCode={code}
        groupFlags={flags}
        tint={palette.tint}
        accent={palette.accent}
        legendQtyMap={legendQtyMap}
      />

      {/* Footer nav: equipo anterior/siguiente o salto entre grupos */}
      <nav className="border-t pt-6 grid grid-cols-2 gap-3">
        <Link
          href={prev.href}
          className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Anterior
            </div>
            <div className="font-medium truncate flex items-center gap-1.5">
              {prev.icon && (
                <span className="text-lg leading-none" aria-hidden>
                  {prev.icon}
                </span>
              )}
              {prev.label}
            </div>
          </div>
        </Link>
        <Link
          href={next.href}
          className="flex items-center justify-end gap-3 rounded-xl border p-3 hover:bg-muted transition-colors text-right"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Siguiente
            </div>
            <div className="font-medium truncate flex items-center justify-end gap-1.5">
              {next.icon && (
                <span className="text-lg leading-none" aria-hidden>
                  {next.icon}
                </span>
              )}
              {next.label}
            </div>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
      </nav>
    </div>
  );
}
