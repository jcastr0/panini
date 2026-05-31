"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw } from "lucide-react";
import { resubscribeAction } from "./actions";

export function ResubscribeForm({
  prefKey,
  prefLabel,
}: {
  prefKey: string;
  prefLabel: string;
}) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="text-sm text-[var(--gold)] inline-flex items-center gap-1.5">
        <Check className="size-4" /> Volviste a activar {prefLabel}
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await resubscribeAction(formData);
          if (result.error) setError(result.error);
          else setDone(true);
        });
      }}
      className="space-y-2"
    >
      <input type="hidden" name="pref" value={prefKey} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        <RotateCcw className="size-4" />
        {pending ? "…" : "Volver a activar"}
      </button>
      {error && <p className="text-xs text-[var(--panini-red)]">{error}</p>}
    </form>
  );
}
