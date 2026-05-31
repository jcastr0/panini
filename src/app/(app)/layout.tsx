import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./_components/user-menu";
import { MobileTabBar } from "./_components/mobile-tab-bar";
import { NotificationBell } from "./_components/notification-bell";
import { AppFooter, AppFooterMobile } from "./_components/app-footer";

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

  const [profileQ, { count: pendingTrades }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "username, display_name, avatar_url, collector_card_base64, country, department, city",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("trades")
      .select("id", { count: "exact", head: true })
      .eq("to_user", user.id)
      .eq("status", "pending"),
  ]);

  // department es de migración nueva — casteamos hasta regenerar types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileQ.data as any;
  const p = profile;
  const locationMissing =
    !p?.country ||
    !p?.city ||
    String(p.city).trim() === "" ||
    (p.country === "Colombia" && !p.department);
  if (locationMissing) redirect("/onboarding");

  return (
    <div className="flex-1 flex flex-col">
      <header
        className="border-b sticky top-0 bg-background/85 backdrop-blur z-20"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-display font-bold tracking-tight text-lg"
            >
              Panini
              <span className="text-[var(--gold)]">·</span>
              <span className="text-[var(--panini-blue)]">JD</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <NavLink href="/album">Álbum</NavLink>
              <NavLink href="/collection">Mi colección</NavLink>
              <NavLink href="/trades">
                Intercambios
                {pendingTrades ? (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold text-white"
                    style={{ background: "var(--panini-red)" }}
                  >
                    {pendingTrades > 9 ? "9+" : pendingTrades}
                  </span>
                ) : null}
              </NavLink>
              <NavLink href="/amigos">Amigos</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <UserMenu
              email={user.email ?? ""}
              username={profile?.username ?? ""}
              displayName={profile?.display_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
              collectorCardBase64={profile?.collector_card_base64 ?? null}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full pb-24 md:pb-8">
        {children}
        <AppFooterMobile />
      </main>
      <AppFooter />
      <MobileTabBar pendingTrades={pendingTrades ?? 0} />
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center"
    >
      {children}
    </Link>
  );
}
