import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ShareCard } from "../_components/share-card";

export default async function AmigosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  // Búsqueda: si q tiene 1+ caracteres, busca por prefijo ilike. Si no, muestra recientes.
  const query = (q ?? "").trim().toLowerCase();
  let resultsQuery = supabase
    .from("profiles")
    .select("id, username, display_name, city, country, avatar_url, collector_card_base64")
    .eq("is_public_profile", true)
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(48);
  if (query.length > 0) {
    resultsQuery = resultsQuery.ilike("username", `${query}%`);
  }
  const { data: results } = await resultsQuery;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://paninijd.vercel.app";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="eyebrow">Comunidad</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Amigos
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Busca a otros coleccionistas o comparte tu link para que te
          encuentren.
        </p>
      </header>

      {me?.username && <ShareCard username={me.username} baseUrl={baseUrl} />}

      <form className="relative" action="/amigos" method="get">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Busca por @username (ej: jhonatan)"
          className="w-full h-12 pl-11 pr-4 rounded-full border bg-card text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          autoComplete="off"
        />
      </form>

      {query.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {results?.length ?? 0} coleccionista{results?.length === 1 ? "" : "s"}{" "}
          que coinciden con <span className="font-mono">@{query}</span>
        </p>
      )}

      {(!results || results.length === 0) && (
        <div className="border-2 border-dashed rounded-2xl py-12 text-center text-muted-foreground">
          {query.length > 0
            ? "Nadie con ese username público."
            : "Aún no hay otros coleccionistas. Invita a tus amigos con tu link."}
        </div>
      )}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {results?.map((p) => {
          const name = p.display_name || `@${p.username}`;
          const cardSrc = p.collector_card_base64
            ? `data:image/jpeg;base64,${p.collector_card_base64}`
            : p.avatar_url;
          const initials = name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("");
          return (
            <li key={p.id}>
              <Link
                href={`/u/${p.username}`}
                className="block border rounded-xl bg-card p-4 hover:border-[var(--panini-blue)]/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full overflow-hidden bg-muted grid place-items-center text-sm font-semibold ring-1 ring-border">
                    {cardSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cardSrc}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{initials || "?"}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate group-hover:text-[var(--panini-blue)] transition-colors">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{p.username}
                      {p.city ? ` · ${p.city}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
