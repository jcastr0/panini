import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { TradeActions } from "./_components/trade-actions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trade } = await supabase
    .from("trades")
    .select(
      "id, from_user, to_user, status, message, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!trade) notFound();

  const isFrom = trade.from_user === user.id;
  const otherUserId = isFrom ? trade.to_user : trade.from_user;

  const [{ data: items }, { data: profiles }] = await Promise.all([
    supabase
      .from("trade_items")
      .select(
        "id, direction, quantity, sticker_id, stickers(number, name, team, type)",
      )
      .eq("trade_id", id),
    supabase
      .from("profiles")
      .select("id, username, display_name, city, avatar_url")
      .in("id", [trade.from_user, trade.to_user]),
  ]);

  const pMap = new Map((profiles ?? []).map((p) => [p.id, p] as const));
  const other = pMap.get(otherUserId);

  const offered = (items ?? []).filter((i) => i.direction === "offer");
  const requested = (items ?? []).filter((i) => i.direction === "request");

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Intercambio</span>
          <Badge variant="outline" className="font-mono text-[10px]">
            {STATUS_LABEL[trade.status]}
          </Badge>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {isFrom ? "Propuesta a " : "Propuesta de "}
          <span className="text-[var(--pitch)]">
            {other?.display_name || `@${other?.username ?? "usuario"}`}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Creada{" "}
          {new Date(trade.created_at).toLocaleString("es-CO", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      {trade.message && (
        <blockquote className="border-l-4 border-[var(--pitch)] pl-4 py-1 text-muted-foreground italic">
          “{trade.message}”
        </blockquote>
      )}

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <Column
          title={isFrom ? "Tú ofreces" : "Te ofrecen"}
          accent="gold"
          items={offered}
        />
        <div className="hidden lg:flex items-center justify-center text-muted-foreground">
          <ArrowRight className="size-5" />
        </div>
        <Column
          title={isFrom ? "Tú pides" : "Te piden"}
          accent="pitch"
          items={requested}
        />
      </div>

      <TradeActions
        tradeId={trade.id}
        status={trade.status}
        isFrom={isFrom}
        isTo={!isFrom}
      />
    </div>
  );
}

function Column({
  title,
  accent,
  items,
}: {
  title: string;
  accent: "pitch" | "gold";
  items: Array<{
    id: string;
    quantity: number;
    stickers:
      | {
          number: number;
          name: string;
          team: string | null;
          type: "normal" | "shiny" | "legend" | "special";
        }
      | null;
  }>;
}) {
  const bar = accent === "pitch" ? "bg-[var(--pitch)]" : "bg-[var(--gold)]";
  return (
    <div className="border rounded-xl bg-card overflow-hidden flex flex-col">
      <div className={`h-1 w-full ${bar}`} />
      <div className="p-5 flex-1">
        <h2 className="font-display text-xl font-semibold mb-4 tracking-tight">
          {title}
        </h2>
        <ul className="divide-y border rounded-md">
          {items.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground text-center">
              Nada en esta dirección.
            </li>
          )}
          {items.map((it) => (
            <li key={it.id} className="p-3 flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground tabular w-12">
                #{String(it.stickers?.number ?? 0).padStart(3, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {it.stickers?.team ?? it.stickers?.name}
                </p>
                {it.stickers?.team && it.stickers.team !== it.stickers.name && (
                  <p className="text-xs text-muted-foreground truncate">
                    {it.stickers.name}
                  </p>
                )}
              </div>
              <span className="font-display text-lg font-bold tabular">
                ×{it.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
