import { createClient } from "@/lib/supabase/server";
import { TradesTable, type AdminTradeRow } from "./_components/trades-table";

const PAGE_SIZE = 50;

export default async function AdminTradesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string }>;
}) {
  const { status, type, q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  // Filtro por participante: resolvemos los user_ids por username primero.
  let participantIds: string[] | null = null;
  if (q) {
    const term = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ps } = await (supabase as any)
      .from("profiles")
      .select("id")
      .ilike("username", term)
      .limit(200);
    participantIds = ((ps ?? []) as Array<{ id: string }>).map((p) => p.id);
    if (participantIds.length === 0) participantIds = ["00000000-0000-0000-0000-000000000000"];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("trades")
    .select(
      "id, from_user, to_user, status, trade_type, price_cents, created_at, trade_items(id)",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  if (type) query = query.eq("trade_type", type);
  if (participantIds) {
    const idList = participantIds.map((i) => `"${i}"`).join(",");
    query = query.or(`from_user.in.(${idList}),to_user.in.(${idList})`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: trades, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const userIds = new Set<string>();
  for (const t of (trades ?? []) as Array<{ from_user: string; to_user: string }>) {
    userIds.add(t.from_user);
    userIds.add(t.to_user);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, username")
    .in("id", [...userIds]);
  const usernameById = new Map(
    ((profiles ?? []) as Array<{ id: string; username: string }>).map((p) => [p.id, p.username]),
  );

  const rows: AdminTradeRow[] = (
    (trades ?? []) as Array<{
      id: string;
      from_user: string;
      to_user: string;
      status: string;
      trade_type: "swap" | "gift" | "sale" | null;
      price_cents: number | null;
      created_at: string;
      trade_items: Array<{ id: string }>;
    }>
  ).map((t) => ({
    id: t.id,
    from_username: usernameById.get(t.from_user) ?? "?",
    to_username: usernameById.get(t.to_user) ?? "?",
    status: t.status,
    trade_type: t.trade_type,
    price_cents: t.price_cents,
    items_count: t.trade_items?.length ?? 0,
    created_at: t.created_at,
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Intercambios
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} trades coinciden con los filtros.
        </p>
      </header>

      <TradesTable rows={rows} totalCount={count ?? 0} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
