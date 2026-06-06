import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/app/(app)/_components/user-menu";
import { MobileTabBar } from "@/app/(app)/_components/mobile-tab-bar";
import { NotificationBell } from "@/app/(app)/_components/notification-bell";
import { AppFooter, AppFooterMobile } from "@/app/(app)/_components/app-footer";
import { SupportButton } from "@/app/(app)/_components/support-button";
import { PhoneCampaignBanner } from "@/app/(app)/_components/phone-campaign-banner";
import { ScrollToHash } from "@/app/(app)/_components/scroll-to-hash";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si hay sesión, mostramos la nav completa de la app (idéntica a (app)/layout)
  // para que el usuario logueado pueda seguir navegando mientras mira otros perfiles.
  if (user) {
    const [profileQ, { count: pendingTrades }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "username, display_name, avatar_url, collector_card_base64, country, department, city, phone",
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
        <PhoneCampaignBanner phoneMissing={!p?.phone} />
        <ScrollToHash />
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full pb-24 md:pb-8">
          {children}
          <AppFooterMobile />
        </main>
        <AppFooter />
        <MobileTabBar pendingTrades={pendingTrades ?? 0} />
      </div>
    );
  }

  // Sin sesión: header público con CTAs a login / signup
  return (
    <div className="flex-1 flex flex-col">
      <header
        className="border-b"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-bold tracking-tight text-lg"
          >
            Panini
            <span className="text-[var(--gold)]">·</span>
            <span className="text-[var(--panini-blue)]">JD</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--panini-blue)] text-white px-4 h-9 text-sm font-medium hover:opacity-90"
            >
              Crear cuenta <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
      <footer className="border-t py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap text-xs text-muted-foreground">
          <p>Panini·JD · Proyecto independiente, no afiliado a Panini Group</p>
          <SupportButton />
        </div>
      </footer>
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
