import { createClient } from "@/lib/supabase/server";
import { AlbumsList, type AdminAlbumRow } from "./_components/albums-list";

export default async function AdminAlbumsPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: albumsRaw } = (await (supabase as any)
    .from("albums")
    .select("id, code, name, edition_year, total_stickers, is_active, created_at")
    .order("edition_year", { ascending: false })) as {
    data: Array<{
      id: string;
      code: string;
      name: string;
      edition_year: number | null;
      total_stickers: number;
      is_active: boolean;
      created_at: string;
    }> | null;
  };
  const albums: AdminAlbumRow[] = (albumsRaw ?? []).map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    year: a.edition_year,
    total_stickers: a.total_stickers,
    is_active: a.is_active,
    created_at: a.created_at,
  }));

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
      <AlbumsList albums={albums} />
    </div>
  );
}
