import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum } from "@/lib/queries";
import { ProposeForm } from "./_components/propose-form";

type Sticker = {
  id: string;
  number: number;
  name: string;
  team: string | null;
  group_code: string | null;
  type: "normal" | "shiny" | "legend" | "special";
};

export default async function NewTradeWithUser({
  params,
}: {
  params: Promise<{ otherId: string }>;
}) {
  const { otherId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === otherId) notFound();

  const album = await getActiveAlbum();
  if (!album) return <p>No hay álbum activo.</p>;

  const [{ data: other }, { data: stickers }, { data: myStickers }, { data: theirStickers }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, city, country, avatar_url")
        .eq("id", otherId)
        .maybeSingle(),
      supabase
        .from("stickers")
        .select("id, number, name, team, group_code, type")
        .eq("album_id", album.id)
        .order("number", { ascending: true })
        .range(0, 9999),
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", user.id)
        .range(0, 9999),
      supabase
        .from("user_stickers")
        .select("sticker_id, quantity")
        .eq("user_id", otherId)
        .range(0, 9999),
    ]);

  if (!other) notFound();

  const myQty = new Map<string, number>();
  (myStickers ?? []).forEach((r) => myQty.set(r.sticker_id, r.quantity ?? 0));
  const theirQty = new Map<string, number>();
  (theirStickers ?? []).forEach((r) =>
    theirQty.set(r.sticker_id, r.quantity ?? 0),
  );

  // Lo que puedo ofrecer: mis repetidos (qty>1) que a la otra persona le falten (qty=0)
  const canOffer = ((stickers ?? []) as Sticker[]).filter((s) => {
    const mine = myQty.get(s.id) ?? 0;
    const theirs = theirQty.get(s.id) ?? 0;
    return mine > 1 && theirs === 0;
  });

  // Lo que puedo pedir: cromos que el otro tiene repetidos y a mí me faltan
  const canRequest = ((stickers ?? []) as Sticker[]).filter((s) => {
    const mine = myQty.get(s.id) ?? 0;
    const theirs = theirQty.get(s.id) ?? 0;
    return mine === 0 && theirs > 1;
  });

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="eyebrow">Nueva propuesta</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Intercambio con{" "}
          <span className="text-[var(--panini-blue)]">
            {other.display_name || `@${other.username}`}
          </span>
        </h1>
        {other.city && (
          <p className="text-muted-foreground">{other.city}</p>
        )}
      </header>

      <ProposeForm
        toUser={other.id}
        canOffer={canOffer.map((s) => ({
          ...s,
          mine: myQty.get(s.id) ?? 0,
          theirs: theirQty.get(s.id) ?? 0,
        }))}
        canRequest={canRequest.map((s) => ({
          ...s,
          mine: myQty.get(s.id) ?? 0,
          theirs: theirQty.get(s.id) ?? 0,
        }))}
      />
    </div>
  );
}
