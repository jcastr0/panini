import { notFound, redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { stickerImagePath } from "@/lib/sticker-image";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/email/client";
import { TradeActions } from "./_components/trade-actions";
import { PendingPasteBanner } from "./_components/pending-paste-banner";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  completed: "Completada",
};

type ItemRow = {
  id: string;
  direction: "offer" | "request";
  quantity: number;
  sticker_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stickers: any;
  // pasted_at agregado en migración 0038
  pasted_at?: string | null;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: trade } = (await (supabase as any)
    .from("trades")
    .select(
      "id, from_user, to_user, status, message, created_at, updated_at, auto_pasted",
    )
    .eq("id", id)
    .maybeSingle()) as {
    data: {
      id: string;
      from_user: string;
      to_user: string;
      status: string;
      message: string | null;
      created_at: string;
      updated_at: string;
      auto_pasted: boolean | null;
    } | null;
  };
  if (!trade) notFound();

  const isFrom = trade.from_user === user.id;
  const otherUserId = isFrom ? trade.to_user : trade.from_user;

  const [{ data: itemsRaw }, { data: profiles }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("trade_items")
      .select(
        "id, direction, quantity, sticker_id, pasted_at, stickers(code, number, name, team, type)",
      )
      .eq("trade_id", id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("profiles")
      .select("id, username, display_name, city, avatar_url, phone")
      .in("id", [trade.from_user, trade.to_user]),
  ]);

  const items: ItemRow[] = (itemsRaw ?? []) as ItemRow[];

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

  // Cargar cantidades actuales de ambos participantes para los sticker_ids del trade
  // Solo nos importa validar disponibilidad si el trade NO está completed/rejected/cancelled
  const isLiveTrade = trade.status === "pending" || trade.status === "accepted";
  const stickerIds = [...new Set(items.map((i) => i.sticker_id))];

  let qtyByUser: Record<string, Map<string, number>> = {};
  if (isLiveTrade && stickerIds.length > 0) {
    const { data: us } = await supabase
      .from("user_stickers")
      .select("user_id, sticker_id, quantity")
      .in("user_id", [trade.from_user, trade.to_user])
      .in("sticker_id", stickerIds);
    qtyByUser = { [trade.from_user]: new Map(), [trade.to_user]: new Map() };
    (us ?? []).forEach((r) => {
      qtyByUser[r.user_id]?.set(r.sticker_id, r.quantity ?? 0);
    });
  }

  // Marcar cada item con su disponibilidad real (giver tiene cantidad >= quantity?)
  type EnrichedItem = ItemRow & { available: number; isAvailable: boolean };
  const enriched: EnrichedItem[] = items.map((it) => {
    if (!isLiveTrade) return { ...it, available: it.quantity, isAvailable: true };
    const giver = it.direction === "offer" ? trade.from_user : trade.to_user;
    const have = qtyByUser[giver]?.get(it.sticker_id) ?? 0;
    return { ...it, available: have, isAvailable: have >= it.quantity };
  });

  const offered = enriched.filter((i) => i.direction === "offer");
  const requested = enriched.filter((i) => i.direction === "request");

  // ─────────────────────────────────────────────────────────────────────
  // Análisis PRIVADO: ¿con lo que YO recibo del trade completo equipo/página?
  // Solo se calcula para el usuario actual (auth.uid()) y solo se renderiza
  // en su columna. El otro participante NUNCA ve esta info.
  // ─────────────────────────────────────────────────────────────────────
  type Completion = { kind: "team" | "page"; label: string };
  const myCompletions: Completion[] = [];
  const myIncoming = enriched.filter((it) => {
    const receiver = it.direction === "offer" ? trade.to_user : trade.from_user;
    return receiver === user.id;
  });
  if (myIncoming.length > 0) {
    // Sticker_ids que yo recibo
    const incomingIds = new Set(myIncoming.map((it) => it.sticker_id));

    // Cargar info de stickers + qué páginas/equipos tocan
    const incomingTeams = new Set<string>();
    const incomingPages = new Set<number>();
    for (const it of myIncoming) {
      const sticker = it.stickers;
      if (!sticker) continue;
      if (sticker.team && sticker.group_code) incomingTeams.add(sticker.team);
      if (typeof sticker.page === "number") incomingPages.add(sticker.page);
    }

    // Cargar TODOS los stickers de esos equipos/páginas tocados
    // Construimos un OR para Supabase: team.in.(...) OR page.in.(...)
    const teamList = [...incomingTeams];
    const pageList = [...incomingPages];

    if (teamList.length > 0 || pageList.length > 0) {
      const orConditions: string[] = [];
      if (teamList.length > 0) {
        const teamCsv = teamList
          .map((t) => `"${t.replace(/"/g, '\\"')}"`)
          .join(",");
        orConditions.push(`team.in.(${teamCsv})`);
      }
      if (pageList.length > 0) {
        orConditions.push(`page.in.(${pageList.join(",")})`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: related } = (await (supabase as any)
        .from("stickers")
        .select("id, team, group_code, page, type")
        .or(orConditions.join(","))) as {
        data: Array<{
          id: string;
          team: string | null;
          group_code: string | null;
          page: number | null;
          type: string;
        }> | null;
      };

      const relatedIds = (related ?? []).map((r) => r.id);
      let myCurrentQty = new Map<string, number>();
      if (relatedIds.length > 0) {
        const { data: mineNow } = await supabase
          .from("user_stickers")
          .select("sticker_id, quantity")
          .eq("user_id", user.id)
          .in("sticker_id", relatedIds);
        myCurrentQty = new Map(
          (mineNow ?? []).map((r) => [r.sticker_id, r.quantity ?? 0]),
        );
      }

      // Función helper: dado un grupo de stickers (de un team o page),
      // ¿el trade me completaría ese grupo?
      function isCompletable(stickersInGroup: typeof related): boolean {
        if (!stickersInGroup || stickersInGroup.length === 0) return false;
        for (const s of stickersInGroup) {
          const haveIt = (myCurrentQty.get(s.id) ?? 0) >= 1;
          const willGetIt = incomingIds.has(s.id);
          if (!haveIt && !willGetIt) return false; // me faltaría incluso después
        }
        // ¿El trade aporta al menos 1 nuevo (no todo el grupo ya pegado)?
        const aportaAlgo = stickersInGroup.some(
          (s) => (myCurrentQty.get(s.id) ?? 0) === 0 && incomingIds.has(s.id),
        );
        return aportaAlgo;
      }

      // Verificar equipos
      for (const team of teamList) {
        const teamStickers = (related ?? []).filter((r) => r.team === team);
        if (isCompletable(teamStickers)) {
          myCompletions.push({ kind: "team", label: team });
        }
      }

      // Verificar páginas (solo si NO es de un equipo ya completado para no duplicar)
      for (const page of pageList) {
        const pageStickers = (related ?? []).filter((r) => r.page === page);
        // Si todos los stickers de esta página son de un team que ya marqué, skip
        const teamOfPage = pageStickers[0]?.team;
        if (
          teamOfPage &&
          pageStickers.every((s) => s.team === teamOfPage) &&
          myCompletions.some((c) => c.kind === "team" && c.label === teamOfPage)
        ) {
          continue;
        }
        if (isCompletable(pageStickers)) {
          myCompletions.push({ kind: "page", label: `Página ${page}` });
        }
      }
    }
  }

  // Counts AJUSTADOS — solo cuentan items disponibles
  const offeredAvailableCount = offered
    .filter((i) => i.isAvailable)
    .reduce((s, i) => s + i.quantity, 0);
  const requestedAvailableCount = requested
    .filter((i) => i.isAvailable)
    .reduce((s, i) => s + i.quantity, 0);

  const offeredTotalCount = offered.reduce((s, i) => s + i.quantity, 0);
  const requestedTotalCount = requested.reduce((s, i) => s + i.quantity, 0);

  const hasUnavailableItems =
    offered.some((i) => !i.isAvailable) || requested.some((i) => !i.isAvailable);
  // canProceed = trade está vivo Y todos sus items siguen siendo válidos.
  // Aplica tanto a Aceptar (pending) como a Completar (accepted).
  const canProceed = isLiveTrade && !hasUnavailableItems;

  // Pendientes de pegar (solo si completed y aún sin pegar)
  // El receiver soy yo cuando: en items 'offer' soy el to_user, en items 'request' soy el from_user
  const myPendingItems = enriched.filter((it) => {
    if (trade.status !== "completed") return false;
    if (it.pasted_at) return false;
    const receiver = it.direction === "offer" ? trade.to_user : trade.from_user;
    return receiver === user.id;
  });

  // Para cada pendiente, ¿ya tengo el cromo pegado en mi álbum (quantity > 0)?
  // Si sí → muestro "ya en tu álbum, cerrar ritual" en vez de "Pegar".
  let myCurrentQty = new Map<string, number>();
  if (myPendingItems.length > 0) {
    const ids = myPendingItems.map((it) => it.sticker_id);
    const { data: mineNow } = await supabase
      .from("user_stickers")
      .select("sticker_id, quantity")
      .eq("user_id", user.id)
      .in("sticker_id", ids);
    myCurrentQty = new Map(
      (mineNow ?? []).map((r) => [r.sticker_id, r.quantity ?? 0]),
    );
  }

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

      {hasUnavailableItems && isLiveTrade && (
        <div
          className="rounded-xl border-2 p-4 flex items-start gap-3"
          style={{
            background: "color-mix(in oklab, var(--panini-red) 8%, var(--card))",
            borderColor: "color-mix(in oklab, var(--panini-red) 40%, transparent)",
          }}
        >
          <AlertTriangle className="size-5 text-[var(--panini-red)] shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-semibold">Algunos cromos ya no están disponibles</p>
            <p className="text-muted-foreground">
              Alguno de los dos despegó cromos prometidos en este intercambio.
              Los aparecen tachados abajo y los conteos del header solo
              consideran lo que sí se puede entregar. No se puede completar
              hasta que ambos repropongan o se ajuste la propuesta.
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <Column
          title={isFrom ? "Tú ofreces" : "Te ofrecen"}
          accent="gold"
          items={offered}
          availableCount={offeredAvailableCount}
          totalCount={offeredTotalCount}
          isLiveTrade={isLiveTrade}
          // Si soy 'to_user', los items 'offer' los recibo yo → mostrar completions
          myCompletions={!isFrom ? myCompletions : []}
        />
        <div className="hidden lg:flex items-center justify-center text-muted-foreground">
          <ArrowRight className="size-5" />
        </div>
        <Column
          title={isFrom ? "Tú pides" : "Te piden"}
          accent="pitch"
          items={requested}
          availableCount={requestedAvailableCount}
          totalCount={requestedTotalCount}
          isLiveTrade={isLiveTrade}
          // Si soy 'from_user', los items 'request' los recibo yo → mostrar completions
          myCompletions={isFrom ? myCompletions : []}
        />
      </div>

      {/* Banner de pendientes (solo si yo soy receiver y hay items por pegar) */}
      {myPendingItems.length > 0 && (
        <PendingPasteBanner
          tradeId={trade.id}
          items={myPendingItems.map((it) => ({
            id: it.id,
            sticker_id: it.sticker_id,
            quantity: it.quantity,
            code: it.stickers?.code ?? null,
            name: it.stickers?.name ?? "",
            team: it.stickers?.team ?? null,
            alreadyInAlbum: (myCurrentQty.get(it.sticker_id) ?? 0) > 0,
          }))}
        />
      )}

      {/* WhatsApp del otro participante (si compartió teléfono) */}
      {(() => {
        const otherPhone = other?.phone;
        const me = pMap.get(user.id);
        const myName = me?.display_name ?? `@${me?.username ?? "yo"}`;
        const tradeUrl = `${SITE_URL}/trades/${trade.id}`;

        let msg: string;
        let ctaLabel: string;
        if (trade.status === "accepted") {
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
          msg = `¡Hola! Soy ${myName} desde Panini·JD. Gracias por el intercambio.\n\n${tradeUrl}`;
          ctaLabel = "Escribir por WhatsApp";
        } else {
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
        status={trade.status as "pending" | "accepted" | "rejected" | "cancelled" | "completed"}
        isFrom={isFrom}
        isTo={!isFrom}
        canComplete={canProceed}
        receivingCount={
          isFrom ? requestedAvailableCount : offeredAvailableCount
        }
        givingCount={
          isFrom ? offeredAvailableCount : requestedAvailableCount
        }
      />
    </div>
  );
}

function Column({
  title,
  accent,
  items,
  availableCount,
  totalCount,
  isLiveTrade,
  myCompletions = [],
}: {
  title: string;
  accent: "pitch" | "gold";
  items: Array<{
    id: string;
    quantity: number;
    available: number;
    isAvailable: boolean;
    pasted_at?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stickers: any;
  }>;
  availableCount: number;
  totalCount: number;
  isLiveTrade: boolean;
  myCompletions?: Array<{ kind: "team" | "page"; label: string }>;
}) {
  const bar = accent === "pitch" ? "bg-[var(--panini-blue)]" : "bg-[var(--gold)]";
  return (
    <div className="border rounded-xl bg-card overflow-hidden flex flex-col">
      <div className={`h-1 w-full ${bar}`} />
      <div className="p-5 flex-1">
        <div className="flex items-baseline justify-between gap-2 mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
          {isLiveTrade && availableCount !== totalCount ? (
            <span className="font-mono text-xs text-muted-foreground tabular">
              <span className="text-[var(--panini-red)] font-semibold">
                {availableCount}
              </span>
              <span className="line-through opacity-60 ml-1">
                de {totalCount}
              </span>
            </span>
          ) : (
            <span className="font-mono text-sm text-muted-foreground tabular">
              {totalCount} {totalCount === 1 ? "cromo" : "cromos"}
            </span>
          )}
        </div>

        {myCompletions.length > 0 && (
          <div className="mb-4 rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--gold)] flex items-center gap-1">
              <Sparkles className="size-3" /> Solo tú ves esto
            </p>
            {myCompletions.map((c, i) => (
              <p key={i} className="text-sm font-medium leading-tight">
                {c.kind === "team" ? "✨ " : "🎯 "}
                Con esto completas {c.kind === "team" ? "el equipo" : "la"}{" "}
                <span className="font-semibold">{c.label}</span>
              </p>
            ))}
          </div>
        )}

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
              const unavailable = isLiveTrade && !it.isAvailable;
              return (
                <li
                  key={it.id}
                  className={`relative rounded-lg overflow-hidden border bg-muted/30 group transition-opacity ${unavailable ? "opacity-40" : ""}`}
                  title={
                    unavailable
                      ? `Ya no disponible (queda ${it.available} de ${it.quantity})`
                      : undefined
                  }
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
                    {unavailable && (
                      <span className="absolute top-1 left-1 size-6 grid place-items-center rounded-full bg-[var(--panini-red)] text-white">
                        <AlertTriangle className="size-3.5" />
                      </span>
                    )}
                    {it.pasted_at && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[var(--gold)]/90 text-foreground uppercase tracking-wider">
                        pegado
                      </span>
                    )}
                  </div>
                  <div className="px-1.5 py-1 border-t bg-card">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {it.stickers?.code ?? `#${it.stickers?.number}`}
                    </p>
                    <p className={`text-[11px] font-medium truncate leading-tight ${unavailable ? "line-through" : ""}`}>
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
