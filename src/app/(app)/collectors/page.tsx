import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CollectorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, city, country, avatar_url")
    .eq("is_public_profile", true)
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="eyebrow">Comunidad</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Coleccionistas
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Descubre a otros coleccionistas. Visita su perfil para ver con qué
          podrías intercambiar.
        </p>
      </header>

      {(!profiles || profiles.length === 0) && (
        <p className="border-2 border-dashed rounded-xl py-16 text-center text-muted-foreground">
          Aún no hay otros coleccionistas. Invita a tus amigos.
        </p>
      )}

      <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {profiles?.map((p) => {
          const name = p.display_name || `@${p.username}`;
          const initials = name
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase())
            .join("");
          return (
            <li key={p.id}>
              <Link
                href={`/trades/new/${p.id}`}
                className="block border rounded-xl bg-card p-4 hover:border-foreground/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-muted grid place-items-center font-mono text-sm font-semibold">
                    {initials || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate group-hover:text-[var(--pitch)] transition-colors">
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
