import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Repeat } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { paginate } from "@/lib/queries";
import { PreviewBox } from "./_components/preview-box";

export default async function NewTradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matches, error } = await supabase.rpc("find_trade_matches", {
    p_user_id: user.id,
  });

  // Para mostrar miniaturas: 3 queries paralelas + cómputo de previews
  const matchIds = (matches ?? []).map((m) => m.other_user);
  const [mineRows, theirRows] = matchIds.length
    ? await Promise.all([
        paginate<{ sticker_id: string; quantity: number }>((from, to) =>
          supabase
            .from("user_stickers")
            .select("sticker_id, quantity")
            .eq("user_id", user.id)
            .range(from, to),
        ),
        paginate<{ user_id: string; sticker_id: string; quantity: number }>((from, to) =>
          supabase
            .from("user_stickers")
            .select("user_id, sticker_id, quantity")
            .in("user_id", matchIds)
            .range(from, to),
        ),
      ])
    : [[], []];

  // Stickers catalog para code lookup (1 query, paginated)
  const stickerCatalog = matchIds.length
    ? await paginate<{ id: string; code: string | null; name: string; team: string | null }>(
        (from, to) =>
          supabase
            .from("stickers")
            .select("id, code, name, team")
            .range(from, to),
      )
    : [];

  const stickerById = new Map(stickerCatalog.map((s) => [s.id, s]));
  const myHas = new Map<string, number>();
  mineRows.forEach((r) => myHas.set(r.sticker_id, r.quantity ?? 0));

  // Index: por user_id → set de stickers (qty>=2) y set total (qty>=1)
  const theirDupesByUser = new Map<string, string[]>();
  const theirOwnedByUser = new Map<string, Set<string>>();
  theirRows.forEach((r) => {
    if ((r.quantity ?? 0) >= 1) {
      if (!theirOwnedByUser.has(r.user_id)) theirOwnedByUser.set(r.user_id, new Set());
      theirOwnedByUser.get(r.user_id)!.add(r.sticker_id);
    }
    if ((r.quantity ?? 0) >= 2) {
      if (!theirDupesByUser.has(r.user_id)) theirDupesByUser.set(r.user_id, []);
      theirDupesByUser.get(r.user_id)!.push(r.sticker_id);
    }
  });

  const myDupes = [...myHas.entries()]
    .filter(([, q]) => q >= 2)
    .map(([id]) => id);

  function previewsFor(otherId: string) {
    // they_offer: sus repetidos que a mí me faltan (todos)
    const theyOfferIds = (theirDupesByUser.get(otherId) ?? []).filter(
      (sid) => (myHas.get(sid) ?? 0) === 0,
    );
    // i_offer: mis repetidos que a ellos les faltan (todos)
    const theirOwned = theirOwnedByUser.get(otherId) ?? new Set();
    const iOfferIds = myDupes.filter((sid) => !theirOwned.has(sid));
    return {
      theyOffer: theyOfferIds.map((id) => stickerById.get(id)).filter(Boolean) as Array<{
        id: string;
        code: string | null;
        name: string;
        team: string | null;
      }>,
      iOffer: iOfferIds.map((id) => stickerById.get(id)).filter(Boolean) as Array<{
        id: string;
        code: string | null;
        name: string;
        team: string | null;
      }>,
    };
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="eyebrow">Encuentra a quién</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Matches de intercambio
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Coleccionistas con repetidos de cromos que te faltan, y a quienes tú
          puedes ofrecer. El{" "}
          <span className="font-medium text-foreground">score</span> mide el
          potencial total del intercambio.
        </p>
      </header>

      {error && (
        <div className="text-sm text-[var(--panini-red)]">
          Error al cargar matches: {error.message}
        </div>
      )}

      {(!matches || matches.length === 0) && (
        <div className="border-2 border-dashed rounded-xl py-16 px-6 text-center space-y-3">
          <Repeat className="size-6 mx-auto text-muted-foreground" />
          <p className="font-display text-xl font-semibold">
            Aún no hay matches
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Necesitas tener repetidos y cromos faltantes para que otros usuarios
            cuadren contigo.
          </p>
          <Button asChild variant="outline">
            <Link href="/album">Ir al álbum</Link>
          </Button>
        </div>
      )}

      {matches && matches.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-4">
          {matches.map((m) => (
            <li
              key={m.other_user}
              className="border rounded-xl p-5 bg-card flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-muted grid place-items-center font-mono text-sm font-semibold">
                    {(m.display_name || m.username || "?")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-semibold leading-tight">
                      {m.display_name || `@${m.username}`}
                    </p>
                    {m.city && (
                      <p className="text-xs text-muted-foreground">{m.city}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold tabular text-[var(--panini-blue)]">
                    {m.score}
                  </p>
                  <p className="eyebrow">Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <PreviewBox
                  label="Te ofrecen"
                  total={m.they_offer_count}
                  items={previewsFor(m.other_user).theyOffer}
                  bg="oklab,var(--card),var(--panini-blue)_8%"
                  border="oklab,var(--panini-blue)_30%,transparent"
                  otherDisplayName={m.display_name || `@${m.username}`}
                />
                <PreviewBox
                  label="Tú ofreces"
                  total={m.i_offer_count}
                  items={previewsFor(m.other_user).iOffer}
                  bg="oklab,var(--card),var(--gold)_10%"
                  border="oklab,var(--gold)_40%,transparent"
                  otherDisplayName={m.display_name || `@${m.username}`}
                />
              </div>
              <Button asChild className="self-end mt-1">
                <Link href={`/trades/new/${m.other_user}`}>
                  Proponer intercambio <ArrowUpRight className="ml-1 size-4" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

