"use client";

import * as React from "react";
import Link from "next/link";
import { useTransition } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ExternalLink, MoreVertical, Shield, ShieldOff, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmTypingDialog } from "../../_components/confirm-typing-dialog";
import { restoreUser, setUserBanned, softDeleteUser } from "../actions";

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  status: "active" | "banned" | "deleted";
  deleted_at: string | null;
};

export function UserRowMenu({ row }: { row: Row }) {
  const [banOpen, setBanOpen] = React.useState(false);
  const [banReason, setBanReason] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const isBanned = row.status === "banned";
  const isDeleted = row.status === "deleted";

  const canRestore =
    isDeleted &&
    row.deleted_at &&
    Date.now() - new Date(row.deleted_at).getTime() < 30 * 24 * 3600 * 1000;

  function doBan() {
    startTransition(async () => {
      const res = await setUserBanned({
        user_id: row.id,
        banned: !isBanned,
        reason: banReason.trim() || null,
      });
      if (res?.error) toast.error(res.error);
      else toast.success(isBanned ? "Usuario desbaneado" : "Usuario baneado");
      setBanOpen(false);
      setBanReason("");
    });
  }

  function doDelete() {
    startTransition(async () => {
      const res = await softDeleteUser({ user_id: row.id });
      if (res?.error) toast.error(res.error);
      else toast.success("Usuario marcado como eliminado");
      setDeleteOpen(false);
    });
  }

  function doRestore() {
    startTransition(async () => {
      const res = await restoreUser({ user_id: row.id });
      if (res?.error) toast.error(res.error);
      else toast.success("Usuario restaurado");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          {!isDeleted && (
            <DropdownMenuItem render={<Link href={`/u/${row.username}`} target="_blank" />}>
              <ExternalLink className="mr-2 size-4" /> Ver perfil
            </DropdownMenuItem>
          )}
          {!isDeleted && (
            <DropdownMenuItem onClick={() => setBanOpen(true)}>
              {isBanned ? (
                <>
                  <ShieldOff className="mr-2 size-4" /> Desbanear
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" /> Banear
                </>
              )}
            </DropdownMenuItem>
          )}
          {!isDeleted && (
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 size-4 text-[var(--panini-red)]" />
              Eliminar
            </DropdownMenuItem>
          )}
          {canRestore && (
            <DropdownMenuItem onClick={doRestore}>
              <Undo2 className="mr-2 size-4" /> Restaurar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Ban */}
      <Dialog.Root open={banOpen} onOpenChange={setBanOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <Dialog.Title className="font-display text-xl font-semibold">
              {isBanned ? "Desbanear usuario" : "Banear usuario"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {isBanned
                ? `Permitir que ${row.display_name || "@" + row.username} vuelva a entrar.`
                : `Bloquear a ${row.display_name || "@" + row.username} y cancelar sus trades en curso.`}
            </Dialog.Description>
            {!isBanned && (
              <div className="space-y-1.5">
                <label className="eyebrow block">Razón (opcional)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Conducta inapropiada, fraude reportado, etc."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setBanOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant={isBanned ? "default" : "destructive"}
                disabled={pending}
                onClick={doBan}
              >
                {pending ? "Procesando…" : isBanned ? "Desbanear" : "Banear"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog Soft-Delete (con typing del @username) */}
      <ConfirmTypingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar usuario"
        description={
          <>
            Marca al usuario como eliminado. Sus trades activos se cancelan y
            su <span className="font-mono">@{row.username}</span> queda
            liberado. Se puede restaurar dentro de 30 días.
          </>
        }
        confirmText={`@${row.username}`}
        destructiveLabel="Eliminar"
        pending={pending}
        onConfirm={doDelete}
      />
    </>
  );
}
