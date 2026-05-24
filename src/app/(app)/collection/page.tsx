import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getCollectorCard,
  getUserStats,
} from "@/lib/queries";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  sectionHref,
  sectionKey as resolveSectionKey,
  sectionLabel,
  sectionPalette,
  SECTION_ORDER,
  type GroupCode,
  type SpecialKey,
} from "@/lib/album-config";
import { StickerCard } from "../album/_components/sticker-card";
import { AlbumOwnerTag } from "../album/_components/album-owner-tag";

type S = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  group_code: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  page: number | null;
};

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stickersResult, ownedResult, stats, collectorCard] = await Promise.all(
    [
      supabase
        .from("stickers")
        .select("id, code, number, name, team, group_code, type, page")
        .eq("album_id", album.id)
        .order("page", { ascending: true })
        .order("number", { ascending: true }),
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", user.id),
      getUserStats(user.id),
      getCollectorCard(user.id),
    ],
  );

  const stickers = (stickersResult.data ?? []) as S[];
  const qtyMap = new Map<string, number>();
  (ownedResult.data ?? []).forEach((r) =>
    qtyMap.set(r.sticker_id, r.quantity ?? 0),
  );

  const owned = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) >= 1);
  const dupes = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) > 1);
  const missing = stickers.filter((s) => (qtyMap.get(s.id) ?? 0) === 0);

  const ownerProps = {
    username: collectorCard?.username ?? "",
    displayName: collectorCard?.display_name ?? null,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <AlbumOwnerTag {...ownerProps} size="sm" />
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <span className="eyebrow">Tu álbum</span>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Mi colección
            </h1>
          </div>
          <span className="font-mono tabular text-sm text-muted-foreground">
            {stats.owned}/{stats.total} cromos
          </span>
        </div>
      </header>

      <div className="grid sm:grid-cols-4 gap-3">
        <BigStat label="Avance" value={`${stats.percent}%`} accent="pitch">
          <Progress value={stats.percent} className="mt-3" />
        </BigStat>
        <BigStat label="🟢 Tienes" value={stats.owned} />
        <BigStat label="🔴 Faltan" value={stats.missing} accent="red" />
        <BigStat label="🟡 Repetidos" value={stats.duplicates} accent="gold" />
      </div>

      <Tabs defaultValue="owned" className="space-y-6">
        <TabsList className="h-auto p-1">
          <TabsTrigger value="owned" className="text-base py-2.5 px-4">
            Tienes ({owned.length})
          </TabsTrigger>
          <TabsTrigger value="dupes" className="text-base py-2.5 px-4">
            Repetidos ({dupes.length})
          </TabsTrigger>
          <TabsTrigger value="missing" className="text-base py-2.5 px-4">
            Faltantes ({missing.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owned">
          <BySection
            stickers={owned}
            qtyMap={qtyMap}
            empty="Aún no marcas cromos como tuyos."
          />
        </TabsContent>
        <TabsContent value="dupes">
          {dupes.length === 0 ? (
            <EmptyState
              title="Sin repetidos por ahora"
              text="Cuando tengas 2+ de un cromo, aparecerá aquí y podrás ofrecerlo en intercambios."
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Estos los puedes ofrecer.{" "}
                <Link
                  href="/trades/new"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Buscar matches →
                </Link>
              </p>
              <BySection stickers={dupes} qtyMap={qtyMap} />
            </>
          )}
        </TabsContent>
        <TabsContent value="missing">
          <BySection
            stickers={missing}
            qtyMap={qtyMap}
            empty="¡Felicidades, lo tienes todo!"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BySection({
  stickers,
  qtyMap,
  empty,
}: {
  stickers: S[];
  qtyMap: Map<string, number>;
  empty?: string;
}) {
  if (stickers.length === 0 && empty) {
    return <EmptyState title={empty} />;
  }
  // Agrupar por sección manteniendo el orden de SECTION_ORDER
  const grouped = new Map<GroupCode | SpecialKey, S[]>();
  stickers.forEach((s) => {
    const key = resolveSectionKey(s.group_code, s.page);
    if (key === "other") return;
    const k = key as GroupCode | SpecialKey;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(s);
  });

  return (
    <div className="space-y-8">
      {SECTION_ORDER.map((key) => {
        const list = grouped.get(key);
        if (!list || list.length === 0) return null;
        const palette = sectionPalette(key);
        return (
          <section
            key={key}
            className="space-y-3"
            style={
              {
                "--accent-section": palette.accent,
              } as React.CSSProperties
            }
          >
            <Link
              href={sectionHref(key)}
              className="flex items-center justify-between gap-3 group"
            >
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-xl font-semibold tracking-tight group-hover:underline underline-offset-4"
                  style={{ color: palette.accent }}
                >
                  {sectionLabel(key)}
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {list.length} cromos
                </span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Ver sección →
              </span>
            </Link>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {list.map((s) => (
                <StickerCard
                  key={s.id}
                  id={s.id}
                  code={s.code}
                  number={s.number}
                  name={s.name}
                  team={s.team}
                  type={s.type}
                  initialQuantity={qtyMap.get(s.id) ?? 0}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value: string | number;
  accent?: "pitch" | "red" | "gold";
  children?: React.ReactNode;
}) {
  const color =
    accent === "pitch"
      ? "text-[var(--panini-blue)]"
      : accent === "red"
        ? "text-[var(--panini-red)]"
        : accent === "gold"
          ? "text-[var(--gold)]"
          : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="eyebrow mb-2">{label}</div>
      <div className={`font-display text-4xl font-bold tabular ${color}`}>
        {value}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="text-center border-2 border-dashed rounded-xl py-16 px-6">
      <p className="font-display text-xl font-semibold">{title}</p>
      {text && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {text}
        </p>
      )}
    </div>
  );
}
