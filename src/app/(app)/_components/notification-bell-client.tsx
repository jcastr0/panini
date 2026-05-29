"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, Sparkles, ArrowLeftRight, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { NotificationRow } from "@/lib/queries";
import { markAllNotificationsRead, markNotificationRead } from "./notification-actions";

const ICON_BY_KIND: Record<NotificationRow["kind"], React.ComponentType<{ className?: string }>> = {
  trade_received: ArrowLeftRight,
  trade_accepted: Check,
  trade_rejected: X,
  trade_completed: Check,
  trade_superseded: X,
  trade_cancelled: X,
  duplicate_available: Sparkles,
};

function notifLabel(n: NotificationRow): string {
  const who = n.from_display_name || (n.from_username ? `@${n.from_username}` : "alguien");
  switch (n.kind) {
    case "duplicate_available":
      return `${who} tiene ${n.sticker_name ?? "un cromo"} repetido — posible match`;
    case "trade_received":
      return "Te llegó una propuesta de intercambio";
    case "trade_accepted":
      return "Aceptaron tu propuesta";
    case "trade_rejected":
      return "Rechazaron tu propuesta";
    case "trade_completed":
      return "El intercambio se completó";
    case "trade_superseded":
      return "Tu propuesta cayó: el cromo ya se intercambió";
    case "trade_cancelled":
      return "Cancelaron una propuesta";
  }
}

function notifHref(n: NotificationRow): string {
  if (n.kind === "duplicate_available" && n.from_username) {
    return `/trades/new?with=${n.from_username}${n.sticker_code ? `&focus=${n.sticker_code}` : ""}`;
  }
  if (n.trade_id) return `/trades/${n.trade_id}`;
  return "/trades";
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

export function NotificationBellClient({
  count,
  items,
}: {
  count: number;
  items: NotificationRow[];
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleMarkAll = () => startTransition(() => void markAllNotificationsRead());
  const handleClickItem = (id: string, read: boolean) => {
    if (!read) startTransition(() => void markNotificationRead(id));
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center size-10 rounded-full hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={`Notificaciones${count > 0 ? ` (${count} sin leer)` : ""}`}
      >
        <Bell className="size-5" />
        {count > 0 && (
          <Badge
            className="absolute -top-0.5 -right-0.5 h-5 min-w-5 p-0 grid place-items-center text-[10px] font-bold bg-[var(--panini-red)] text-white border-2 border-background"
            variant="default"
          >
            {count > 9 ? "9+" : count}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1rem))] p-0 overflow-hidden"
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="font-display font-semibold">Notificaciones</span>
          {count > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              Marcar todas leídas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tienes notificaciones todavía.
            </div>
          ) : (
            <ul>
              {items.map((n) => {
                const Icon = ICON_BY_KIND[n.kind];
                const unread = !n.read_at;
                return (
                  <li key={n.id} className="border-b last:border-b-0">
                    <Link
                      href={notifHref(n)}
                      onClick={() => handleClickItem(n.id, !unread)}
                      className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                        unread ? "bg-[var(--panini-blue)]/5" : ""
                      }`}
                    >
                      <div
                        className={`size-8 rounded-full grid place-items-center shrink-0 ${
                          unread
                            ? "bg-[var(--panini-blue)] text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug">{notifLabel(n)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>
                      {unread && (
                        <span className="size-2 rounded-full bg-[var(--panini-blue)] shrink-0 mt-1.5" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
