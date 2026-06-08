import { createClient } from "@/lib/supabase/server";
import { StatCard } from "../_components/stat-card";
import { SignupsChart } from "../_components/signups-chart";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    usersCount,
    bannedCount,
    deletedCount,
    tradesByStatus,
    stuckCount,
    signupsRaw,
    activity24h,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is("banned_at" as any, null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is("deleted_at" as any, null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .not("banned_at" as any, "is", null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .not("deleted_at" as any, "is", null),
    supabase.from("trades").select("status"),
    supabase
      .from("user_stickers")
      .select("quantity", { count: "exact", head: true })
      .gte("quantity", 1),
    // Signups por día (últimos 30 días)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc("get_admin_signups_per_day", { p_days: 30 }),
    Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("updated_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
    ]),
  ]);

  const statusCounts: Record<string, number> = {
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };
  for (const row of (tradesByStatus.data ?? []) as Array<{ status: string }>) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const signups = (signupsRaw.data ?? []) as Array<{ day: string; n: number }>;
  const signupBars = signups.map((s) => ({
    date: s.day.slice(5), // MM-DD
    count: Number(s.n) || 0,
  }));

  const [newSignups, newTrades, newCompletes] = activity24h;

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Usuarios activos"
          value={(usersCount.count ?? 0).toLocaleString("es-CO")}
          hint={`${bannedCount.count ?? 0} baneados · ${deletedCount.count ?? 0} borrados`}
          accent="blue"
        />
        <StatCard
          label="Trades pending"
          value={statusCounts.pending}
          hint={`${statusCounts.accepted} accepted`}
          accent="gold"
        />
        <StatCard
          label="Trades completados"
          value={statusCounts.completed}
          hint={`${statusCounts.cancelled + statusCounts.rejected} cancelados/rechazados`}
          accent="green"
        />
        <StatCard
          label="Cromos en circulación"
          value={(stuckCount.count ?? 0).toLocaleString("es-CO")}
          hint="filas user_stickers con qty ≥ 1"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Signups 24h"
          value={newSignups.count ?? 0}
          accent="blue"
        />
        <StatCard
          label="Trades creados 24h"
          value={newTrades.count ?? 0}
          accent="gold"
        />
        <StatCard
          label="Trades completados 24h"
          value={newCompletes.count ?? 0}
          accent="green"
        />
      </section>

      <SignupsChart days={signupBars} />
    </div>
  );
}
