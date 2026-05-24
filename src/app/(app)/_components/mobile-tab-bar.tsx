"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Repeat, Plus, Layers, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: string;
};

const TABS: Tab[] = [
  { href: "/album",       label: "Álbum",      icon: BookOpen, matchPrefix: "/album" },
  { href: "/collection",  label: "Colección",  icon: Layers,   matchPrefix: "/collection" },
  { href: "/trades/new",  label: "Crear",      icon: Plus      }, // FAB central
  { href: "/trades",      label: "Trades",     icon: Repeat,   matchPrefix: "/trades" },
  { href: "/profile",     label: "Yo",         icon: User,     matchPrefix: "/profile" },
];

export function MobileTabBar({
  pendingTrades = 0,
}: {
  pendingTrades?: number;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {TABS.map((t, i) => {
          const isFab = i === 2;
          const isActive = t.matchPrefix
            ? pathname === t.href || pathname.startsWith(`${t.matchPrefix}/`)
            : false;
          const badge = t.href === "/trades" && pendingTrades > 0 ? pendingTrades : null;
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex">
              {isFab ? (
                <Link
                  href={t.href}
                  aria-label={t.label}
                  className="flex-1 flex items-center justify-center -mt-5"
                >
                  <span
                    className="size-14 rounded-full grid place-items-center text-white shadow-lg ring-4 ring-card"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--panini-blue), var(--gold))",
                    }}
                  >
                    <Icon className="size-6" />
                  </span>
                </Link>
              ) : (
                <Link
                  href={t.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors",
                    isActive
                      ? "text-[var(--panini-blue)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="relative">
                    <Icon className="size-5" />
                    {badge !== null && (
                      <span
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold flex items-center justify-center text-white shadow"
                        style={{ background: "var(--panini-red)" }}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-medium leading-none">
                    {t.label}
                  </span>
                  {isActive && (
                    <span
                      className="absolute top-0 inset-x-6 h-0.5 rounded-full"
                      style={{ background: "var(--panini-blue)" }}
                    />
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
