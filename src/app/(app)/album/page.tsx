import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum, getUserStats } from "@/lib/queries";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StickerCard } from "./_components/sticker-card";

export default async function AlbumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) {
    return <p>No hay álbum activo.</p>;
  }

  const [{ data: stickers }, { data: owned }, stats] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, number, name, team, group_code, type, page")
      .eq("album_id", album.id)
      .order("number", { ascending: true }),
    supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id),
    getUserStats(user.id),
  ]);

  const qtyMap = new Map<string, number>();
  (owned ?? []).forEach((r) => qtyMap.set(r.sticker_id, r.quantity ?? 0));

  type S = NonNullable<typeof stickers>[number];

  // Intro (group_code null) agrupado por página; equipos agrupados por grupo/equipo
  const introByPage = new Map<number, S[]>();
  const groups = new Map<string, Map<string, S[]>>();
  (stickers ?? []).forEach((s) => {
    if (!s.group_code) {
      const p = s.page ?? 0;
      if (!introByPage.has(p)) introByPage.set(p, []);
      introByPage.get(p)!.push(s);
      return;
    }
    if (!groups.has(s.group_code)) groups.set(s.group_code, new Map());
    const g = groups.get(s.group_code)!;
    const teamKey = s.team ?? "";
    if (!g.has(teamKey)) g.set(teamKey, []);
    g.get(teamKey)!.push(s);
  });
  const introPages = [...introByPage.entries()].sort(([a], [b]) => a - b);
  const introTotal = introPages.reduce((a, [, l]) => a + l.length, 0);
  const introOwned = introPages.reduce(
    (a, [, l]) =>
      a + l.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1).length,
    0,
  );

  const PAGE_TITLES: Record<number, string> = {
    0: "Portada",
    1: "El Trofeo",
    2: "Identidad del torneo",
    3: "Balón y póster oficial",
  };

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Álbum</span>
          <span className="h-px flex-1 bg-border" />
          <Badge variant="outline" className="font-mono text-[10px]">
            Edición {album.edition_year}
          </Badge>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {album.name}
        </h1>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <p className="text-muted-foreground max-w-xl">
            Marca cada cromo con su cantidad. Si tienes 2 o más, será un{" "}
            <span className="text-[var(--gold)] font-medium">repetido</span> y
            podrás ofrecerlo en intercambios.
          </p>
          <div className="min-w-64 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono tabular text-muted-foreground">
                {stats.owned}/{stats.total}
              </span>
              <span className="font-display font-semibold tabular">
                {stats.percent}%
              </span>
            </div>
            <Progress value={stats.percent} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap pt-2">
          <a
            href="#intro"
            className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full border hover:bg-muted transition-colors"
          >
            Intro
          </a>
          {[...groups.keys()].map((g) => (
            <a
              key={g}
              href={`#grupo-${g}`}
              className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full border hover:bg-muted transition-colors"
            >
              Grupo {g}
            </a>
          ))}
        </div>
      </header>

      {introPages.length > 0 && (
        <section id="intro" className="space-y-6 scroll-mt-20">
          <SectionHeader
            title="Apertura"
            subtitle={`Páginas 0–${introPages[introPages.length - 1][0]} · ${introOwned}/${introTotal}`}
          />
          <div className="grid lg:grid-cols-2 gap-6">
            {introPages.map(([page, list]) => {
              const ownedInPage = list.filter(
                (s) => (qtyMap.get(s.id) ?? 0) >= 1,
              ).length;
              return (
                <div
                  key={page}
                  className="border rounded-xl bg-card p-4 space-y-3 relative"
                >
                  <div className="absolute -top-2 left-4 px-2 bg-background">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Página {String(page).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-end justify-between pt-1">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {PAGE_TITLES[page] ?? `Página ${page}`}
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground tabular">
                      {ownedInPage}/{list.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {list.map((s) => (
                      <StickerCard
                        key={s.id}
                        id={s.id}
                        number={s.number}
                        name={s.name}
                        team={s.team}
                        type={s.type}
                        initialQuantity={qtyMap.get(s.id) ?? 0}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {[...groups.entries()].map(([groupCode, teams]) => (
        <section
          key={groupCode}
          id={`grupo-${groupCode}`}
          className="space-y-5 scroll-mt-20"
        >
          <SectionHeader
            title={`Grupo ${groupCode}`}
            subtitle={`${teams.size} equipos · ${[...teams.values()].reduce((a, t) => a + t.length, 0)} cromos`}
          />
          <div className="space-y-6">
            {[...teams.entries()].map(([teamName, list]) => {
              const ownedInTeam = list.filter(
                (s) => (qtyMap.get(s.id) ?? 0) >= 1,
              ).length;
              return (
                <div key={teamName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {teamName}
                    </h3>
                    <span className="font-mono text-xs text-muted-foreground tabular">
                      {ownedInTeam}/{list.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {list.map((s) => (
                      <StickerCard
                        key={s.id}
                        id={s.id}
                        number={s.number}
                        name={s.name}
                        team={s.team}
                        type={s.type}
                        initialQuantity={qtyMap.get(s.id) ?? 0}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="border-t pt-6 text-sm text-muted-foreground flex items-center justify-between">
        <span>¿Listo para intercambiar?</span>
        <Link
          href="/trades/new"
          className="inline-flex items-center gap-1 font-medium text-foreground hover:underline underline-offset-4"
        >
          Buscar matches <ChevronDown className="size-4 -rotate-90" />
        </Link>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      <div className="pitch-line w-24" />
    </div>
  );
}
