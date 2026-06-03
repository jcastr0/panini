"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { stickerImagePath } from "@/lib/sticker-image";
import { pasteTradeItem, pasteRemainingTradeItems } from "../../actions";

export type PendingItem = {
  id: string;
  sticker_id: string;
  quantity: number;
  code: string | null;
  name: string;
  team: string | null;
};

/**
 * Banner que aparece en el detalle del trade COMPLETED cuando el receiver
 * eligió "no pegar automáticamente". Muestra la lista de cromos pendientes
 * y permite pegarlos uno por uno (ritual) o todos de una.
 */
export function PendingPasteBanner({
  tradeId,
  items,
}: {
  tradeId: string;
  items: PendingItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pastedNow, setPastedNow] = useState<Set<string>>(new Set());

  function pasteOne(itemId: string) {
    startTransition(async () => {
      const r = await pasteTradeItem(itemId);
      if (r.error) {
        toast.error(r.error);
        return;
      }
      setPastedNow((prev) => new Set(prev).add(itemId));
      toast.success("Cromo pegado ✨");
      // No refresh inmediato — dejamos que el user pegue de a uno con animación
    });
  }

  function pasteAll() {
    startTransition(async () => {
      const r = await pasteRemainingTradeItems(tradeId);
      if (r.error) {
        toast.error(r.error);
        return;
      }
      toast.success(`Pegaste ${r.pasted} cromos`);
      router.refresh();
    });
  }

  const visibleItems = items.filter((it) => !pastedNow.has(it.id));
  if (visibleItems.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 text-center space-y-2">
        <Sparkles className="size-6 text-[var(--gold)] mx-auto" />
        <p className="font-display font-semibold">Pegaste todos los cromos del trade</p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="text-sm underline underline-offset-4 hover:text-foreground"
        >
          Refrescar página
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border-2 p-5 space-y-4"
      style={{
        background: "color-mix(in oklab, var(--gold) 6%, var(--card))",
        borderColor: "color-mix(in oklab, var(--gold) 40%, transparent)",
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--gold)]" />
            Tienes {visibleItems.length} cromo
            {visibleItems.length === 1 ? "" : "s"} por pegar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pégalos uno por uno como en el álbum físico, o usa el botón para
            pegarlos todos de una.
          </p>
        </div>
        <button
          type="button"
          onClick={pasteAll}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 h-9 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Check className="size-4" /> Pegar todos
        </button>
      </div>

      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {visibleItems.map((it) => {
          const img = stickerImagePath(it.code);
          return (
            <li
              key={it.id}
              className="rounded-lg overflow-hidden border bg-card relative"
            >
              <div className="relative w-full aspect-[3/4]">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={it.name}
                    className="absolute inset-0 size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center p-1 text-center">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {it.code}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1.5">
                <p className="text-[10px] font-mono text-muted-foreground truncate">
                  {it.code ?? `#${it.sticker_id.slice(0, 4)}`}
                </p>
                <p className="text-[11px] font-medium truncate leading-tight">
                  {it.team ?? it.name}
                </p>
                <button
                  type="button"
                  onClick={() => pasteOne(it.id)}
                  disabled={pending}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-md bg-[var(--gold)] text-foreground px-2 h-7 text-[11px] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Sparkles className="size-3" /> Pegar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
