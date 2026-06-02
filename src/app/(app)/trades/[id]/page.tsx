import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { stickerImagePath } from "@/lib/sticker-image";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/email/client";
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
        "id, direction, quantity, sticker_id, stickers(code, number, name, team, type)",
      )
      .eq("trade_id", id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("profiles")
      .select("id, username, display_name, city, avatar_url, phone")
      .in("id", [trade.from_user, trade.to_user]),
  ]);

  type ProfileRow = {
    id: string;
    username: string | null;
    display_name: string | null;
    city: string | null;
    avatar_url: string | null;
    phone: string | null;
  };
  const pMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p] as const),
  );
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
          <span className="text-[var(--panini-blue)]">
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
        <blockquote className="border-l-4 border-[var(--panini-blue)] pl-4 py-1 text-muted-foreground italic">
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

      {/* WhatsApp del otro participante (si compartió teléfono) */}
      {(() => {
        const otherPhone = other?.phone;
        const me = pMap.get(user.id);
        const myName = me?.display_name ?? `@${me?.username ?? "yo"}`;
        const tradeUrl = `${SITE_URL}/trades/${trade.id}`;

        // Mensaje según el estado del trade
        let msg: string;
        let ctaLabel: string;
        if (trade.status === "accepted") {
          // Trade aceptado por ambas partes — sugerir encuentro
          msg = [
            `¡Hola! Soy ${myName} desde Panini·JD.`,
            "",
            "Como ya aceptamos el intercambio, te propongo encontrarnos en el",
            "Ocean Mall de Santa Marta para hacer el cambio. ¿Te queda bien?",
            "",
            `Detalles del trade: ${tradeUrl}`,
          ].join("\n");
          ctaLabel = "Acordar encuentro";
        } else if (trade.status === "completed") {
          msg = `¡Hola ${myName ? "" : ""}! Soy ${myName} desde Panini·JD. Gracias por el intercambio.\n\n${tradeUrl}`;
          ctaLabel = "Escribir por WhatsApp";
        } else {
          // pending: mensaje genérico de propuesta
          msg = isFrom
            ? `¡Hola! Soy ${myName} desde Panini·JD. Te propuse un intercambio, ¿qué dices?\n\n${tradeUrl}`
            : `¡Hola! Soy ${myName} desde Panini·JD. Te respondo sobre tu propuesta de intercambio.\n\n${tradeUrl}`;
          ctaLabel = "Coordinar por WhatsApp";
        }

        const waUrl = otherPhone ? buildWhatsAppUrl(otherPhone, msg) : null;
        if (!waUrl) return null;
        return (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 h-11 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#25D366" }}
          >
            <WhatsAppIcon className="size-4" />
            {ctaLabel}
          </a>
        );
      })()}

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
          code: string | null;
          number: number;
          name: string;
          team: string | null;
          type: "normal" | "shiny" | "legend" | "special";
        }
      | null;
  }>;
}) {
  const bar = accent === "pitch" ? "bg-[var(--panini-blue)]" : "bg-[var(--gold)]";
  return (
    <div className="border rounded-xl bg-card overflow-hidden flex flex-col">
      <div className={`h-1 w-full ${bar}`} />
      <div className="p-5 flex-1">
        <h2 className="font-display text-xl font-semibold mb-4 tracking-tight">
          {title}
        </h2>
        {items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground text-center border rounded-md">
            Nada en esta dirección.
          </p>
        ) : (
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {items.map((it) => {
              const img = stickerImagePath(it.stickers?.code);
              const isHorizontal =
                it.stickers?.code === "0" ||
                it.stickers?.code === "00" ||
                it.stickers?.code === "3";
              return (
                <li
                  key={it.id}
                  className="relative rounded-lg overflow-hidden border bg-muted/30 group"
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: isHorizontal ? "4/3" : "3/4" }}
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={it.stickers?.name ?? ""}
                        className="absolute inset-0 size-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center p-1 text-center">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {it.stickers?.code ?? `#${it.stickers?.number}`}
                        </span>
                      </div>
                    )}
                    {it.quantity > 1 && (
                      <span className="absolute top-1 right-1 size-5 grid place-items-center rounded-full text-[10px] font-bold bg-foreground text-background ring-2 ring-card">
                        {it.quantity}
                      </span>
                    )}
                  </div>
                  <div className="px-1.5 py-1 border-t bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {it.stickers?.code ?? `#${it.stickers?.number}`}
                    </p>
                    <p className="text-[11px] font-medium truncate leading-tight">
                      {it.stickers?.team ?? it.stickers?.name}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
