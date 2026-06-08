"use client";

import { useState, useTransition } from "react";
import { Check, X, Ban, CheckCheck, AlertTriangle, Wrench, Clock, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { updateTradeStatus, reconcileTrade } from "../../actions";

type Status = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export function TradeActions({
  tradeId,
  status,
  isFrom,
  isTo,
  canComplete = true,
  receivingCount = 0,
  givingCount = 0,
}: {
  tradeId: string;
  status: Status;
  isFrom: boolean;
  isTo: boolean;
  /** False si hay items no disponibles → bloquea Accept/Complete */
  canComplete?: boolean;
  receivingCount?: number;
  givingCount?: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [autoPaste, setAutoPaste] = useState(true);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  function runStatus(
    s: "accepted" | "rejected" | "cancelled" | "completed",
    autoPaste?: boolean,
  ) {
    startTransition(async () => {
      const res = await updateTradeStatus({
        trade_id: tradeId,
        status: s,
        auto_paste: autoPaste,
      });
      if (res && "error" in res && res.error) {
        if (res.error.startsWith("TRADE_OUTDATED")) {
          toast.error(
            "Alguno ya no tiene los cromos prometidos. Usa 'Ajustar trade' antes.",
          );
        } else {
          toast.error(res.error);
        }
        return;
      }
      toast.success(
        s === "completed"
          ? autoPaste
            ? "Trade completado y cromos pegados"
            : "Trade completado, te quedan cromos por pegar"
          : "Estado actualizado",
      );
      setCompleteDialogOpen(false);
      router.refresh();
    });
  }

  function runReconcile() {
    startTransition(async () => {
      const res = await reconcileTrade(tradeId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (res.autoCancelled) {
        toast.message(
          "El trade ya no era posible: se canceló porque no quedaron cromos en una de las direcciones.",
        );
      } else if (res.adjusted === 0 && res.removed === 0) {
        toast.message("Ya estaba sincronizado, nada que ajustar.");
      } else {
        toast.success(
          `Trade ajustado: ${res.adjusted} reducidos, ${res.removed} eliminados.`,
        );
      }
      setReconcileOpen(false);
      router.refresh();
    });
  }

  if (status === "rejected" || status === "cancelled" || status === "completed") {
    return null;
  }

  // Mensaje contextual según el estado y el rol del usuario
  let statusHint: { icon: React.ReactNode; title: string; body: string } | null = null;
  if (status === "pending" && isFrom) {
    statusHint = {
      icon: <Clock className="size-5 text-[var(--panini-blue)]" />,
      title: "Esperando que el otro acepte la propuesta",
      body: "No puedes marcar como completada hasta que la otra persona acepte el trade. Si ya hicieron el cambio físico, pídele por WhatsApp que entre a aceptarlo, o cancela esta propuesta y vuelve a armarla cuando se reencuentren.",
    };
  } else if (status === "pending" && isTo) {
    statusHint = {
      icon: <Info className="size-5 text-[var(--panini-blue)]" />,
      title: "Te están proponiendo este intercambio",
      body: "Si te interesa, dale Aceptar. Después cualquiera de los dos puede marcarlo como completado cuando hayan hecho el cambio físico.",
    };
  } else if (status === "accepted") {
    statusHint = {
      icon: <CheckCheck className="size-5 text-[var(--gold)]" />,
      title: "Trade aceptado — listo para completarse",
      body: "Cuando hagan el intercambio físico, cualquiera de los dos puede marcarlo como completada. Puedes coordinarse el encuentro por WhatsApp.",
    };
  }

  return (
    <div className="border rounded-xl bg-card p-5 space-y-4">
      {statusHint && (
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5">{statusHint.icon}</span>
          <div className="space-y-1">
            <p className="font-display font-semibold leading-tight">
              {statusHint.title}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {statusHint.body}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
      {/* Botón Ajustar — visible solo si canComplete=false (hay desbalance) */}
      {!canComplete && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => setReconcileOpen(true)}
          className="border-[var(--panini-red)]/50 text-[var(--panini-red)] hover:bg-[var(--panini-red)]/10"
        >
          <Wrench className="mr-1 size-4" /> Ajustar trade
        </Button>
      )}

      {status === "pending" && isTo && (
        <>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => runStatus("rejected")}
          >
            <X className="mr-1 size-4" /> Rechazar
          </Button>
          <Button
            disabled={pending || !canComplete}
            onClick={() => runStatus("accepted")}
            className="bg-[var(--panini-blue)] hover:bg-[var(--panini-blue)]/90"
            title={!canComplete ? "Ajusta el trade antes de aceptar" : undefined}
          >
            <Check className="mr-1 size-4" /> Aceptar
          </Button>
        </>
      )}
      {status === "pending" && isFrom && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => runStatus("cancelled")}
        >
          <Ban className="mr-1 size-4" /> Cancelar propuesta
        </Button>
      )}
      {status === "accepted" && (
        <Button
          disabled={pending || !canComplete}
          onClick={() => {
            setAutoPaste(true);
            setCompleteDialogOpen(true);
          }}
          className="bg-foreground text-background hover:bg-foreground/90"
          title={!canComplete ? "Ajusta el trade antes de completar" : undefined}
        >
          <CheckCheck className="mr-1 size-4" /> Marcar como completada
        </Button>
      )}
      </div>

      {/* Dialog Ajustar (reconcile) */}
      <ConfirmDialog
        open={reconcileOpen}
        onOpenChange={setReconcileOpen}
        title="¿Ajustar el trade a lo realmente disponible?"
        description={
          <>
            El sistema va a <strong>reducir las cantidades</strong> de los cromos
            a lo que efectivamente está disponible, y{" "}
            <strong>eliminar items</strong> de cromos que ya no se tienen. Si
            después no queda nada para intercambiar en alguna dirección, el
            trade se cancela automáticamente.
            <br />
            <br />
            Cualquiera de los dos puede hacerlo.
          </>
        }
        confirmLabel="Sí, ajustar"
        cancelLabel="Cancelar"
        variant="destructive"
        onConfirm={runReconcile}
        pending={pending}
        icon={<Wrench className="size-5" />}
      />

      {/* Dialog Completar con switch auto-paste */}
      <DialogPrimitive.Root
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
              "duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
            )}
          />
          <DialogPrimitive.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[min(460px,94vw)] flex flex-col bg-card border rounded-2xl shadow-2xl overflow-hidden outline-none",
              "duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
              "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <div className="px-6 pt-6 pb-2">
              <div className="size-12 rounded-full grid place-items-center mb-4 bg-[var(--panini-blue)]/10 text-[var(--panini-blue)]">
                <CheckCheck className="size-5" />
              </div>
              <DialogPrimitive.Title className="font-display text-lg font-semibold tracking-tight">
                Confirmar el intercambio
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Estás por marcar este trade como completado.
              </DialogPrimitive.Description>
            </div>

            <div className="px-6 pb-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 bg-[var(--gold)]/5">
                  <p className="eyebrow text-[10px]">Entregas</p>
                  <p className="font-display text-2xl font-bold tabular text-[var(--gold)]">
                    {givingCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    cromo{givingCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-lg border p-3 bg-[var(--panini-blue)]/5">
                  <p className="eyebrow text-[10px]">Recibes</p>
                  <p className="font-display text-2xl font-bold tabular text-[var(--panini-blue)]">
                    {receivingCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    cromo{receivingCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
                <Switch
                  checked={autoPaste}
                  onCheckedChange={setAutoPaste}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 flex-1">
                  <p className="text-sm font-medium">
                    Pegar mis cromos automáticamente
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {autoPaste
                      ? "Los cromos que recibo se suman a mi álbum de inmediato."
                      : "Recibo los cromos pero los pego yo después, uno por uno (ritual)."}
                  </p>
                </div>
              </label>

              {givingCount === 0 && receivingCount === 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--panini-red)]/10 text-sm">
                  <AlertTriangle className="size-4 text-[var(--panini-red)] shrink-0 mt-0.5" />
                  <span>
                    No hay cromos disponibles para intercambiar. Ajusta el trade
                    antes.
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-4 flex gap-2 justify-end">
              <DialogPrimitive.Close
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md border bg-card px-4 h-10 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </DialogPrimitive.Close>
              <button
                type="button"
                onClick={() => runStatus("completed", autoPaste)}
                disabled={pending || (givingCount === 0 && receivingCount === 0)}
                className="inline-flex items-center gap-1.5 rounded-md px-4 h-10 text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <CheckCheck className="size-4" /> Confirmar
              </button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
