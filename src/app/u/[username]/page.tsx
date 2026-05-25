import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum, getAllSectionStats } from "@/lib/queries";
import { SECTION_ORDER } from "@/lib/album-config";
import { SectionTile } from "@/app/(app)/album/_components/section-tile";
import { ProgressRing } from "@/app/(app)/album/_components/progress-ring";
import { AlbumOwnerTag } from "@/app/(app)/album/_components/album-owner-tag";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, city, country, avatar_url, collector_card_base64, is_public_profile",
    )
    .eq("username", username)
    .maybeSingle();

  if (!profile || !profile.is_public_profile) notFound();

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  // Reusamos getAllSectionStats con el ID del dueño del álbum visto
  const sectionStats = await getAllSectionStats(profile.id, album.id);

  let total = 0;
  let owned = 0;
  sectionStats.forEach((s) => {
    total += s.total;
    owned += s.owned;
  });
  const percent = total > 0 ? Math.round((owned / total) * 100) : 0;

  const ownerProps = {
    username: profile.username,
    displayName: profile.display_name,
    collectorCardBase64: profile.collector_card_base64,
    avatarUrl: profile.avatar_url,
  };

  const isOwn = viewer?.id === profile.id;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <AlbumOwnerTag {...ownerProps} size="sm" />

        <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
          <div className="flex items-center gap-4">
            <ProgressRing
              percent={percent}
              size={160}
              label={`${owned} de ${total}`}
            />
            {profile.collector_card_base64 && (
              <div className="hidden sm:block w-24 aspect-[3/4] rounded-lg overflow-hidden ring-1 ring-border shadow-md rotate-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/jpeg;base64,${profile.collector_card_base64}`}
                  alt={`Lámina de @${profile.username}`}
                  className="size-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {profile.display_name || `@${profile.username}`}
            </h1>
            <p className="text-muted-foreground text-base">
              {[profile.city, profile.country].filter(Boolean).join(" · ") ||
                "Coleccionista del Mundial 2026"}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {isOwn ? (
                <Link
                  href="/album"
                  className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-4 h-10 text-sm font-medium"
                >
                  Volver a mi álbum
                </Link>
              ) : viewer ? (
                <Link
                  href={`/trades/new/${profile.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--panini-blue)] text-white px-4 h-10 text-sm font-medium hover:opacity-90"
                >
                  Proponer intercambio <ArrowUpRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--panini-blue)] text-white px-4 h-10 text-sm font-medium hover:opacity-90"
                >
                  Crear cuenta para intercambiar{" "}
                  <ArrowUpRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Su progreso
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {SECTION_ORDER.map((key) => {
            const s = sectionStats.get(key) ?? { total: 0, owned: 0 };
            return (
              <SectionTile
                key={key}
                sectionKey={key}
                owned={s.owned}
                total={s.total}
                viewer={profile.username}
              />
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground italic pt-2">
          Vista de solo lectura · los cromos en este álbum no se pueden
          editar.
        </p>
      </section>
    </div>
  );
}
