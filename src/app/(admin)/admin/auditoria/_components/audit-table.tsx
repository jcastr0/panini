"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export type AdminAuditRow = {
  id: string;
  actor_username: string | null;
  action: string;
  target_kind: string;
  target_id: string | null;
  meta: unknown;
  created_at: string;
};

const ACTION_LABEL: Record<string, string> = {
  ban_user: "Banear",
  unban_user: "Desbanear",
  soft_delete_user: "Borrar usuario",
  restore_user: "Restaurar usuario",
  cancel_trade: "Cancelar trade",
  set_album_active: "Toggle álbum activo",
  update_album_meta: "Editar álbum",
  auto_purge_deleted: "Cron purge",
};

export function AuditTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminAuditRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [actor, setActor] = React.useState(sp.get("actor") ?? "");
  const [action, setAction] = React.useState(sp.get("action") ?? "");

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (actor.trim()) params.set("actor", actor.trim());
    else params.delete("actor");
    if (action) params.set("action", action);
    else params.delete("action");
    params.set("page", "1");
    router.push(`/admin/auditoria?${params.toString()}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/auditoria?${params.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="actor @username"
          className="h-10 rounded-md border bg-card px-3 text-sm flex-1 min-w-[200px]"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todas las acciones</option>
          {Object.entries(ACTION_LABEL).map(([v, lbl]) => (
            <option key={v} value={v}>
              {lbl}
            </option>
          ))}
        </select>
        <button type="button" onClick={applyFilters} className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium">
          Aplicar
        </button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium tabular">Cuándo</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Acción</th>
              <th className="px-3 py-2 font-medium">Target</th>
              <th className="px-3 py-2 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2 text-xs">
                  {r.actor_username ? `@${r.actor_username}` : <span className="text-muted-foreground italic">sistema</span>}
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {ACTION_LABEL[r.action] ?? r.action}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                  {r.target_kind} · {r.target_id?.slice(0, 8) ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      Ver
                    </summary>
                    <pre className="text-[10px] font-mono whitespace-pre-wrap mt-1 max-w-md overflow-auto">
                      {JSON.stringify(r.meta, null, 2)}
                    </pre>
                  </details>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalCount.toLocaleString("es-CO")} resultados · página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Anterior
            </button>
            <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
