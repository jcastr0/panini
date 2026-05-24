import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./_components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, collector_card_base64")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold tracking-tight">
              Panini<span className="text-emerald-600">JD</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <NavLink href="/dashboard">Inicio</NavLink>
              <NavLink href="/album">Álbum</NavLink>
              <NavLink href="/collection">Mi colección</NavLink>
              <NavLink href="/trades">Intercambios</NavLink>
              <NavLink href="/collectors">Coleccionistas</NavLink>
            </nav>
          </div>
          <UserMenu
            email={user.email ?? ""}
            username={profile?.username ?? ""}
            displayName={profile?.display_name ?? null}
            avatarUrl={profile?.avatar_url ?? null}
            collectorCardBase64={profile?.collector_card_base64 ?? null}
          />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      {children}
    </Link>
  );
}
