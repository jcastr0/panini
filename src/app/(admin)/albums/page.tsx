import { createClient } from "@/lib/supabase/server";
import { AlbumsList, type AdminAlbumRow } from "./_components/albums-list";

export default async function AdminAlbumsPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: albums } = (await (supabase as any)
    .from("albums")
    .select("id, code, name, year, total_stickers, is_active, created_at")
    .order("year", { ascending: false })) as {
    data: AdminAlbumRow[] | null;
  };

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Álbumes
        </h1>
        <p className="text-sm text-muted-foreground">
          Solo un álbum puede estar activo a la vez. El activo es el que ve la app.
        </p>
      </header>
      <AlbumsList albums={albums ?? []} />
    </div>
  );
}
