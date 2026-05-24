import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Repeat } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function NewTradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: matches, error } = await supabase.rpc("find_trade_matches", {
    p_user_id: user.id,
  });

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
                  <p className="font-display text-2xl font-bold tabular text-[var(--pitch)]">
                    {m.score}
                  </p>
                  <p className="eyebrow">Score</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-[color-mix(in_oklab,var(--card),var(--pitch)_8%)] border border-[color-mix(in_oklab,var(--pitch)_30%,transparent)] p-3">
                  <p className="eyebrow">Te ofrecen</p>
                  <p className="font-display text-xl tabular">
                    {m.they_offer_count}
                  </p>
                </div>
                <div className="rounded-md bg-[color-mix(in_oklab,var(--card),var(--gold)_10%)] border border-[color-mix(in_oklab,var(--gold)_40%,transparent)] p-3">
                  <p className="eyebrow">Tú ofreces</p>
                  <p className="font-display text-xl tabular">
                    {m.i_offer_count}
                  </p>
                </div>
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
