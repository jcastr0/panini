"use client";

import { useTransition } from "react";
import { Check, X, Ban, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateTradeStatus } from "../../actions";

type Status = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export function TradeActions({
  tradeId,
  status,
  isFrom,
  isTo,
}: {
  tradeId: string;
  status: Status;
  isFrom: boolean;
  isTo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(s: "accepted" | "rejected" | "cancelled" | "completed") {
    startTransition(async () => {
      const res = await updateTradeStatus({ trade_id: tradeId, status: s });
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Estado actualizado");
      router.refresh();
    });
  }

  if (status === "rejected" || status === "cancelled" || status === "completed") {
    return null;
  }

  return (
    <div className="border rounded-xl bg-card p-5 flex flex-wrap items-center justify-end gap-2">
      {status === "pending" && isTo && (
        <>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run("rejected")}
          >
            <X className="mr-1 size-4" /> Rechazar
          </Button>
          <Button
            disabled={pending}
            onClick={() => run("accepted")}
            className="bg-[var(--pitch)] hover:bg-[var(--pitch)]/90"
          >
            <Check className="mr-1 size-4" /> Aceptar
          </Button>
        </>
      )}
      {status === "pending" && isFrom && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => run("cancelled")}
        >
          <Ban className="mr-1 size-4" /> Cancelar propuesta
        </Button>
      )}
      {status === "accepted" && (
        <Button
          disabled={pending}
          onClick={() => run("completed")}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <CheckCheck className="mr-1 size-4" /> Marcar como completada
        </Button>
      )}
    </div>
  );
}
