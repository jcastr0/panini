import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum, getUserStats } from "@/lib/queries";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickerCard } from "../album/_components/sticker-card";

export default async function CollectionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [{ data: stickers }, { data: owned }, stats] = await Promise.all([
    supabase
      .from("stickers")
      .select("id, number, name, team, group_code, type")
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

  const ownedList = (stickers ?? []).filter(
    (s) => (qtyMap.get(s.id) ?? 0) >= 1,
  );
  const dupes = (stickers ?? []).filter((s) => (qtyMap.get(s.id) ?? 0) > 1);
  const missing = (stickers ?? []).filter((s) => (qtyMap.get(s.id) ?? 0) === 0);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="eyebrow">Tu álbum</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Mi colección
        </h1>
      </header>

      <div className="grid sm:grid-cols-4 gap-3">
        <BigStat label="Avance" value={`${stats.percent}%`} accent="pitch">
          <Progress value={stats.percent} className="mt-3" />
        </BigStat>
        <BigStat label="Tienes" value={stats.owned} />
        <BigStat label="Faltan" value={stats.missing} accent="red" />
        <BigStat label="Repetidos" value={stats.duplicates} accent="gold" />
      </div>

      <Tabs defaultValue="owned" className="space-y-6">
        <TabsList>
          <TabsTrigger value="owned">Tienes ({ownedList.length})</TabsTrigger>
          <TabsTrigger value="dupes">Repetidos ({dupes.length})</TabsTrigger>
          <TabsTrigger value="missing">Faltantes ({missing.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="owned">
          <StickerGrid
            stickers={ownedList}
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
                Estos los podrías ofrecer.{" "}
                <Link
                  href="/trades/new"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Buscar matches →
                </Link>
              </p>
              <StickerGrid stickers={dupes} qtyMap={qtyMap} />
            </>
          )}
        </TabsContent>
        <TabsContent value="missing">
          <StickerGrid
            stickers={missing}
            qtyMap={qtyMap}
            empty="¡Felicidades, lo tienes todo!"
          />
        </TabsContent>
      </Tabs>
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
      ? "text-[var(--pitch)]"
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

function StickerGrid({
  stickers,
  qtyMap,
  empty,
}: {
  stickers: Array<{
    id: string;
    number: number;
    name: string;
    team: string | null;
    type: "normal" | "shiny" | "legend" | "special";
  }>;
  qtyMap: Map<string, number>;
  empty?: string;
}) {
  if (stickers.length === 0 && empty) {
    return <EmptyState title={empty} />;
  }
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {stickers.map((s) => (
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
