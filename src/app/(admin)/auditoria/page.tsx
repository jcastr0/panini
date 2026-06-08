import { createClient } from "@/lib/supabase/server";
import { AuditTable, type AdminAuditRow } from "./_components/audit-table";

const PAGE_SIZE = 50;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; action?: string; page?: string }>;
}) {
  const { actor, action, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  let actorIds: string[] | null = null;
  if (actor) {
    const term = `%${actor.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ps } = await (supabase as any)
      .from("profiles")
      .select("id")
      .ilike("username", term)
      .limit(200);
    actorIds = ((ps ?? []) as Array<{ id: string }>).map((p) => p.id);
    if (actorIds.length === 0) actorIds = ["00000000-0000-0000-0000-000000000000"];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("admin_actions")
    .select("id, actor_id, action, target_kind, target_id, meta, created_at", {
      count: "exact",
    });

  if (action) query = query.eq("action", action);
  if (actorIds) query = query.in("actor_id", actorIds);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: actions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const actorIdSet = new Set<string>();
  for (const a of (actions ?? []) as Array<{ actor_id: string | null }>) {
    if (a.actor_id) actorIdSet.add(a.actor_id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, username")
    .in("id", [...actorIdSet]);
  const usernameById = new Map(
    ((profiles ?? []) as Array<{ id: string; username: string }>).map((p) => [p.id, p.username]),
  );

  const rows: AdminAuditRow[] = (
    (actions ?? []) as Array<{
      id: string;
      actor_id: string | null;
      action: string;
      target_kind: string;
      target_id: string | null;
      meta: unknown;
      created_at: string;
    }>
  ).map((a) => ({
    id: a.id,
    actor_username: a.actor_id ? usernameById.get(a.actor_id) ?? null : null,
    action: a.action,
    target_kind: a.target_kind,
    target_id: a.target_id,
    meta: a.meta,
    created_at: a.created_at,
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Auditoría
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} acciones registradas (read-only).
        </p>
      </header>

      <AuditTable rows={rows} totalCount={count ?? 0} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
