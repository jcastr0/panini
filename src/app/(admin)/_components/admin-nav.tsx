"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileClock, Repeat, Users, BookOpen } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Stats", icon: BarChart3 },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/intercambios", label: "Intercambios", icon: Repeat },
  { href: "/admin/albums", label: "Álbumes", icon: BookOpen },
  { href: "/admin/auditoria", label: "Auditoría", icon: FileClock },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
