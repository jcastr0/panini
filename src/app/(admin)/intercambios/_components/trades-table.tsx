"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelTradeAdmin } from "../actions";

export type AdminTradeRow = {
  id: string;
  from_username: string;
  to_username: string;
  status: string;
  trade_type: "swap" | "gift" | "sale" | null;
  price_cents: number | null;
  items_count: number;
  created_at: string;
};

const STATUS_CLS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground",
  rejected: "bg-[var(--panini-red)]/10 text-[var(--panini-red)]",
};

export function TradesTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminTradeRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState(sp.get("status") ?? "");
  const [typeFilter, setTypeFilter] = React.useState(sp.get("type") ?? "");
  const [participant, setParticipant] = React.useState(sp.get("q") ?? "");

  const [cancelTarget, setCancelTarget] = React.useState<AdminTradeRow | null>(null);
  const [reason, setReason] = React.useState("");
  const [pending, startTransition] = useTransition();

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");
    if (typeFilter) params.set("type", typeFilter);
    else params.delete("type");
    if (participant.trim()) params.set("q", participant.trim());
    else params.delete("q");
    params.set("page", "1");
    router.push(`/admin/intercambios?${params.toString()}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/intercambios?${params.toString()}`);
  }

  function doCancel() {
    if (!cancelTarget) return;
    startTransition(async () => {
      const res = await cancelTradeAdmin({
        trade_id: cancelTarget.id,
        reason: reason.trim() || null,
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Trade cancelado");
      setCancelTarget(null);
      setReason("");
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todos los status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todos los tipos</option>
          <option value="swap">Swap</option>
          <option value="gift">Gift</option>
          <option value="sale">Sale</option>
        </select>
        <input
          type="search"
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="@username de participante"
          className="h-10 rounded-md border bg-card px-3 text-sm flex-1 min-w-[200px]"
        />
        <button
          type="button"
          onClick={applyFilters}
          className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium"
        >
          Aplicar
        </button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Trade</th>
              <th className="px-3 py-2 font-medium">Participantes</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium tabular">Items</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium tabular">Fecha</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/trades/${r.id}`} target="_blank" className="hover:underline">
                    {r.id.slice(0, 8)} <ExternalLink className="size-3 inline" />
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className="font-mono">@{r.from_username}</span>
                  <ArrowRight className="size-3 inline mx-1 text-muted-foreground" />
                  <span className="font-mono">@{r.to_username}</span>
                </td>
                <td className="px-3 py-2 text-xs uppercase tracking-wider">
                  {r.trade_type ?? "swap"}
                  {r.price_cents != null && (
                    <span className="ml-1 text-emerald-600 font-mono">
                      ${(r.price_cents / 100).toLocaleString("es-CO")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono tabular">{r.items_count}</td>
                <td className="px-3 py-2">
                  <Badge className={STATUS_CLS[r.status] ?? ""} variant="outline">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2 text-right">
                  {(r.status === "pending" || r.status === "accepted") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[var(--panini-red)]"
                      onClick={() => setCancelTarget(r)}
                    >
                      <X className="size-3.5 mr-1" /> Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
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

      {/* Dialog de cancel */}
      <Dialog.Root open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <Dialog.Title className="font-display text-xl font-semibold">
              Cancelar trade
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Cancelará el intercambio entre <span className="font-mono">@{cancelTarget?.from_username}</span> y <span className="font-mono">@{cancelTarget?.to_username}</span>. Ambos reciben notificación.
            </Dialog.Description>
            <div className="space-y-1.5">
              <label className="eyebrow block">Razón (opcional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelTarget(null)}>
                No, cerrar
              </Button>
              <Button variant="destructive" disabled={pending} onClick={doCancel}>
                {pending ? "Cancelando…" : "Sí, cancelar trade"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
