import { createClient } from "@/lib/supabase/server";
import { UsersTable, type AdminUserRow } from "./_components/users-table";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status = "active", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("profiles")
    .select(
      "id, username, display_name, created_at, banned_at, deleted_at, is_admin",
      { count: "exact" },
    );

  if (status === "active") {
    query = query.is("banned_at", null).is("deleted_at", null);
  } else if (status === "banned") {
    query = query.not("banned_at", "is", null);
  } else if (status === "deleted") {
    query = query.not("deleted_at", "is", null);
  }
  if (q) {
    const term = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    query = query.or(`username.ilike.${term},display_name.ilike.${term}`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: profiles, count } = (await query
    .order("created_at", { ascending: false })
    .range(from, to)) as {
    data:
      | Array<{
          id: string;
          username: string;
          display_name: string | null;
          created_at: string;
          banned_at: string | null;
          deleted_at: string | null;
          is_admin: boolean;
        }>
      | null;
    count: number | null;
  };

  // Emails desde auth.users vía RPC con SECURITY DEFINER (solo admins).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: emails } = (await (supabase as any).rpc("get_admin_user_emails", {
    p_ids: (profiles ?? []).map((p) => p.id),
  })) as { data: Array<{ id: string; email: string | null }> | null };
  const emailMap = new Map((emails ?? []).map((e) => [e.id, e.email]));

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    email: emailMap.get(p.id) ?? null,
    created_at: p.created_at,
    deleted_at: p.deleted_at,
    is_admin: p.is_admin,
    status: p.deleted_at ? "deleted" : p.banned_at ? "banned" : "active",
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Usuarios
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} usuarios coinciden con los filtros.
        </p>
      </header>

      <UsersTable
        rows={rows}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
