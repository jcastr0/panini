"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRowMenu } from "./user-row-menu";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  status: "active" | "banned" | "deleted";
  deleted_at: string | null;
  is_admin: boolean;
};

const STATUS_BADGE: Record<AdminUserRow["status"], { label: string; cls: string }> = {
  active: { label: "Activo", cls: "bg-emerald-100 text-emerald-700" },
  banned: { label: "Baneado", cls: "bg-[var(--panini-red)]/15 text-[var(--panini-red)]" },
  deleted: { label: "Borrado", cls: "bg-muted text-muted-foreground" },
};

export function UsersTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminUserRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [status, setStatus] = React.useState(sp.get("status") ?? "active");

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.set("status", status);
    params.set("page", "1");
    router.push(`/admin/usuarios?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/usuarios?${params.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Buscar por @username o email"
            className="w-full h-10 pl-10 pr-3 rounded-full border bg-card text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border bg-card px-3 text-sm"
        >
          <option value="active">Activos</option>
          <option value="banned">Baneados</option>
          <option value="deleted">Borrados</option>
          <option value="all">Todos</option>
        </select>
        <button
          type="button"
          onClick={applyFilters}
          className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium"
        >
          Aplicar
        </button>
      </div>

      {/* Tabla */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Usuario</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium tabular">Signup</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {r.display_name || `@${r.username}`}
                    {r.is_admin && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--panini-blue)]/15 text-[var(--panini-blue)] font-semibold">
                        admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    @{r.username}
                  </div>
                </td>
                <td className="px-3 py-2 truncate max-w-[200px]" title={r.email ?? ""}>
                  {r.email ?? "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2">
                  <Badge className={STATUS_BADGE[r.status].cls} variant="outline">
                    {STATUS_BADGE[r.status].label}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <UserRowMenu row={r} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalCount.toLocaleString("es-CO")} resultados · página {page} de{" "}
            {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="h-8 px-3 rounded-md border bg-card disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="h-8 px-3 rounded-md border bg-card disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
