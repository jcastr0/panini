import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};
const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "default",
  accepted: "secondary",
  rejected: "destructive",
  cancelled: "outline",
  completed: "secondary",
};

export default async function TradesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: trades } = await supabase
    .from("trades")
    .select("id, status, message, from_user, to_user, created_at")
    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const userIds = new Set<string>();
  (trades ?? []).forEach((t) => {
    userIds.add(t.from_user);
    userIds.add(t.to_user);
  });

  const { data: profiles } = userIds.size
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, city")
        .in("id", [...userIds])
    : { data: [] };

  const pMap = new Map(
    (profiles ?? []).map((p) => [p.id, p] as const),
  );

  const incoming = (trades ?? []).filter((t) => t.to_user === user.id);
  const outgoing = (trades ?? []).filter((t) => t.from_user === user.id);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <span className="eyebrow">Intercambios</span>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Tus propuestas
          </h1>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full">
          <Link href="/trades/new">
            Buscar matches <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Button>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <ArrowDownLeft className="size-4" /> Entrantes
          <span className="text-muted-foreground font-normal tabular">
            ({incoming.length})
          </span>
        </h2>
        {incoming.length === 0 ? (
          <EmptyRow text="Nadie te ha propuesto un intercambio aún." />
        ) : (
          <div className="divide-y border rounded-xl bg-card">
            {incoming.map((t) => {
              const other = pMap.get(t.from_user);
              return (
                <TradeRow
                  key={t.id}
                  href={`/trades/${t.id}`}
                  otherName={other?.display_name || `@${other?.username ?? "?"}`}
                  city={other?.city ?? null}
                  status={t.status}
                  message={t.message}
                  date={t.created_at}
                  direction="incoming"
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <ArrowUpRight className="size-4" /> Salientes
          <span className="text-muted-foreground font-normal tabular">
            ({outgoing.length})
          </span>
        </h2>
        {outgoing.length === 0 ? (
          <EmptyRow text="Aún no has enviado propuestas." />
        ) : (
          <div className="divide-y border rounded-xl bg-card">
            {outgoing.map((t) => {
              const other = pMap.get(t.to_user);
              return (
                <TradeRow
                  key={t.id}
                  href={`/trades/${t.id}`}
                  otherName={other?.display_name || `@${other?.username ?? "?"}`}
                  city={other?.city ?? null}
                  status={t.status}
                  message={t.message}
                  date={t.created_at}
                  direction="outgoing"
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TradeRow({
  href,
  otherName,
  city,
  status,
  message,
  date,
  direction,
}: {
  href: string;
  otherName: string;
  city: string | null;
  status: string;
  message: string | null;
  date: string;
  direction: "incoming" | "outgoing";
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors"
    >
      <div className="size-10 rounded-full bg-muted grid place-items-center font-mono text-sm">
        {otherName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {direction === "incoming" ? "De" : "Para"} {otherName}
          </span>
          {city && (
            <span className="text-xs text-muted-foreground">· {city}</span>
          )}
        </div>
        {message && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {message}
          </p>
        )}
      </div>
      <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
      <span className="text-xs font-mono text-muted-foreground tabular hidden sm:inline">
        {new Date(date).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
          timeZone: "America/Bogota",
        })}
      </span>
    </Link>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
      <Inbox className="size-6" />
      <p>{text}</p>
    </div>
  );
}
