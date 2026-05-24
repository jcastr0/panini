import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveAlbum,
  getAllSectionStats,
  getCollectorCard,
  getUserStats,
} from "@/lib/queries";
import { SECTION_ORDER } from "@/lib/album-config";
import { ProgressRing } from "./_components/progress-ring";
import { SectionTile } from "./_components/section-tile";
import { AlbumOwnerTag } from "./_components/album-owner-tag";

export default async function AlbumIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [stats, sectionStats, collectorCard] = await Promise.all([
    getUserStats(user.id),
    getAllSectionStats(user.id, album.id),
    getCollectorCard(user.id),
  ]);

  const username = collectorCard?.username ?? "";
  const displayName = collectorCard?.display_name ?? null;
  const ownerProps = {
    username,
    displayName,
    collectorCardBase64: collectorCard?.collector_card_base64 ?? null,
    avatarUrl: collectorCard?.avatar_url ?? null,
  };
  const greetName = displayName || (username ? `@${username}` : "coleccionista");

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <AlbumOwnerTag {...ownerProps} size="sm" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Edición {album.edition_year}
          </span>
        </div>

        <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
          <div className="flex items-center gap-4">
            <ProgressRing
              percent={stats.percent}
              size={160}
              label={`${stats.owned} de ${stats.total}`}
            />
            {collectorCard?.collector_card_base64 && (
              <div className="hidden sm:block">
                <CollectorCardPreview
                  base64={collectorCard.collector_card_base64}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Hola, {greetName}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md">
              {stats.percent === 100
                ? "¡Álbum completo! Felicidades, lo lograste."
                : `Te ${stats.missing === 1 ? "falta" : "faltan"} ${stats.missing} cromo${stats.missing === 1 ? "" : "s"} para terminar.`}
            </p>
            {!collectorCard?.collector_card_base64 && (
              <Link
                href="/profile"
                className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline mt-1"
              >
                Sube tu lámina del coleccionista <ArrowUpRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Tus secciones
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-[var(--panini-blue)]" /> tu progreso
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {SECTION_ORDER.map((key) => {
            const s = sectionStats.get(key) ?? { total: 0, owned: 0 };
            return (
              <SectionTile
                key={key}
                sectionKey={key}
                owned={s.owned}
                total={s.total}
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-[var(--gold)]" />
          <div>
            <p className="font-display text-lg font-semibold">
              ¿Listo para intercambiar?
            </p>
            <p className="text-sm text-muted-foreground">
              Encuentra coleccionistas con lo que te falta.
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          <Link href="/trades/new">
            Buscar matches <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function CollectorCardPreview({ base64 }: { base64: string }) {
  return (
    <div className="relative w-24 aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-border shadow-md rotate-2 hover:rotate-0 transition-transform">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/jpeg;base64,${base64}`}
        alt="Tu lámina"
        className="size-full object-cover"
      />
    </div>
  );
}
