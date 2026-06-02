import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getProgressForUsers } from "@/lib/queries";
import { ShareCard } from "../_components/share-card";
import { FriendAvatar } from "./_components/friend-avatar";
import { FriendSearchBox } from "./_components/friend-search-box";

const PAGE_SIZE = 24;

export default async function AmigosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageRaw } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const query = (q ?? "").trim().toLowerCase();
  const currentPage = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Query base con count para paginación
  let resultsQuery = supabase
    .from("profiles")
    .select("id, username, display_name, city, country, avatar_url", {
      count: "exact",
    })
    .eq("is_public_profile", true)
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (query.length > 0) {
    resultsQuery = resultsQuery.ilike("username", `${query}%`);
  }

  const [{ data: me }, resultsResp] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    resultsQuery,
  ]);
  const { data: results, count: totalCount } = resultsResp;

  const progressMap = await getProgressForUsers(
    (results ?? []).map((p) => p.id),
  );

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.paninijd.lat";
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));
  const hasMultiplePages = totalPages > 1;

  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (n > 1) params.set("page", String(n));
    const s = params.toString();
    return `/amigos${s ? `?${s}` : ""}`;
  };

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

      <FriendSearchBox initialQuery={q ?? ""} />

      {totalCount !== null && totalCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          {query.length > 0 ? (
            <>
              {totalCount} coleccionista{totalCount === 1 ? "" : "s"} con{" "}
              <span className="font-mono">@{query}</span>
            </>
          ) : (
            <>
              {totalCount} coleccionista{totalCount === 1 ? "" : "s"} en la
              comunidad
            </>
          )}
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
          const initials = name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("");
          const prog = progressMap.get(p.id);
          return (
            <li key={p.id}>
              <Link
                href={`/u/${p.username}`}
                className="block border rounded-xl bg-card p-4 hover:border-[var(--panini-blue)]/40 transition-colors group space-y-3"
              >
                <div className="flex items-center gap-3">
                  <FriendAvatar
                    username={p.username}
                    avatarUrl={p.avatar_url ?? null}
                    initials={initials}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold truncate group-hover:text-[var(--panini-blue)] transition-colors">
                      {name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{p.username}
                      {p.city ? ` · ${p.city}` : ""}
                    </p>
                  </div>
                </div>

                {prog && prog.total > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted-foreground">Avance</span>
                      <span className="font-mono tabular font-semibold text-[var(--panini-blue)]">
                        {prog.percent}%
                        <span className="text-muted-foreground font-normal ml-1">
                          ({prog.owned}/{prog.total})
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full bg-muted overflow-hidden"
                      role="progressbar"
                      aria-valuenow={prog.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-[var(--panini-blue)] transition-all"
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMultiplePages && (
        <nav className="flex items-center justify-between gap-3 pt-2" aria-label="Paginación">
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1)}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft className="size-4" /> Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-mono text-muted-foreground tabular">
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 h-10 text-sm font-medium hover:bg-muted transition-colors"
            >
              Siguiente <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
