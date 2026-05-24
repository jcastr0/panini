"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createTrade } from "../../../actions";

type Sticker = {
  id: string;
  number: number;
  name: string;
  team: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  mine: number;
  theirs: number;
};

type SelectMap = Record<string, number>;

export function ProposeForm({
  toUser,
  canOffer,
  canRequest,
}: {
  toUser: string;
  canOffer: Sticker[];
  canRequest: Sticker[];
}) {
  const [offers, setOffers] = useState<SelectMap>({});
  const [requests, setRequests] = useState<SelectMap>({});
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const offerCount = useMemo(
    () => Object.values(offers).reduce((a, b) => a + b, 0),
    [offers],
  );
  const requestCount = useMemo(
    () => Object.values(requests).reduce((a, b) => a + b, 0),
    [requests],
  );

  function adjust(
    map: SelectMap,
    setMap: (m: SelectMap) => void,
    id: string,
    max: number,
    delta: number,
  ) {
    const next = Math.max(0, Math.min(max, (map[id] ?? 0) + delta));
    const updated = { ...map };
    if (next === 0) delete updated[id];
    else updated[id] = next;
    setMap(updated);
  }

  function submit() {
    setError(null);
    if (offerCount === 0 || requestCount === 0) {
      setError("Selecciona al menos un cromo a ofrecer y otro a pedir.");
      return;
    }
    const items = [
      ...Object.entries(offers).map(([sticker_id, q]) => ({
        sticker_id,
        direction: "offer" as const,
        quantity: q,
      })),
      ...Object.entries(requests).map(([sticker_id, q]) => ({
        sticker_id,
        direction: "request" as const,
        quantity: q,
      })),
    ];
    startTransition(async () => {
      const res = await createTrade({
        to_user: toUser,
        message: message.trim() || null,
        items,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
        toast.error(res.error);
      }
    });
  }

  if (canOffer.length === 0 && canRequest.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-xl py-16 px-6 text-center">
        <p className="font-display text-xl font-semibold">
          No hay cromos compatibles
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Marca más cromos en tu álbum para que aparezcan opciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel
          title="Tú ofreces"
          subtitle="Tus repetidos que a esta persona le faltan"
          accent="gold"
          count={offerCount}
        >
          <StickerPicker
            stickers={canOffer}
            selected={offers}
            maxFor={(s) => Math.max(0, s.mine - 1)}
            onAdjust={(id, max, d) => adjust(offers, setOffers, id, max, d)}
          />
        </Panel>
        <Panel
          title="Tú pides"
          subtitle="Sus repetidos que a ti te faltan"
          accent="pitch"
          count={requestCount}
        >
          <StickerPicker
            stickers={canRequest}
            selected={requests}
            maxFor={(s) => Math.max(0, s.theirs - 1)}
            onAdjust={(id, max, d) =>
              adjust(requests, setRequests, id, max, d)
            }
          />
        </Panel>
      </div>

      <div className="border rounded-xl bg-card p-5 space-y-3">
        <label htmlFor="msg" className="eyebrow">
          Mensaje (opcional)
        </label>
        <textarea
          id="msg"
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hola, quiero proponerte este intercambio..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="text-xs text-muted-foreground text-right tabular">
          {message.length}/500
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end gap-3 sticky bottom-4">
        <div className="hidden sm:flex items-center gap-4 mr-auto">
          <Stat label="Ofreces" value={offerCount} accent="gold" />
          <Stat label="Pides" value={requestCount} accent="pitch" />
        </div>
        <Button
          onClick={submit}
          disabled={pending || offerCount === 0 || requestCount === 0}
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
        >
          {pending ? "Enviando…" : "Enviar propuesta"}{" "}
          <Check className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  accent,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "pitch" | "gold";
  count: number;
  children: React.ReactNode;
}) {
  const bar =
    accent === "pitch" ? "bg-[var(--panini-blue)]" : "bg-[var(--gold)]";
  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className={`h-1 w-full ${bar}`} />
      <div className="p-5 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <span
            className={cn(
              "font-display text-2xl font-bold tabular",
              accent === "pitch"
                ? "text-[var(--panini-blue)]"
                : "text-[var(--gold)]",
            )}
          >
            {count}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function StickerPicker({
  stickers,
  selected,
  maxFor,
  onAdjust,
}: {
  stickers: Sticker[];
  selected: SelectMap;
  maxFor: (s: Sticker) => number;
  onAdjust: (id: string, max: number, delta: number) => void;
}) {
  if (stickers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground border-2 border-dashed rounded-md p-4 text-center">
        Sin cromos compatibles.
      </p>
    );
  }
  return (
    <ul className="max-h-80 overflow-y-auto divide-y border rounded-md">
      {stickers.map((s) => {
        const qty = selected[s.id] ?? 0;
        const max = maxFor(s);
        const shiny = s.type === "shiny" || s.type === "legend";
        return (
          <li
            key={s.id}
            className="p-3 flex items-center gap-3 hover:bg-muted/40"
          >
            <span className="font-mono text-xs text-muted-foreground tabular w-12">
              #{String(s.number).padStart(3, "0")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate flex items-center gap-1">
                {s.team ?? s.name}
                {shiny && (
                  <Sparkles className="size-3 text-[var(--gold)]" />
                )}
              </p>
              {s.team && s.team !== s.name && (
                <p className="text-xs text-muted-foreground truncate">
                  {s.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onAdjust(s.id, max, -1)}
                disabled={qty === 0}
                className="size-7 rounded-md border grid place-items-center disabled:opacity-30 hover:bg-muted"
              >
                <Minus className="size-3" />
              </button>
              <span className="font-mono tabular text-sm w-7 text-center">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => onAdjust(s.id, max, +1)}
                disabled={qty >= max}
                className="size-7 rounded-md border grid place-items-center disabled:opacity-30 hover:bg-muted"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "pitch" | "gold";
}) {
  return (
    <div className="rounded-md bg-card border px-3 py-1.5">
      <span className="eyebrow mr-2">{label}</span>
      <span
        className={cn(
          "font-display font-semibold tabular",
          accent === "pitch" ? "text-[var(--panini-blue)]" : "text-[var(--gold)]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
