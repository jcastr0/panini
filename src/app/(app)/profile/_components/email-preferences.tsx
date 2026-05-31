"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bell, Sparkles, CalendarDays, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { updateEmailPreference } from "./email-preferences-actions";
import type { PrefKey } from "@/lib/email/unsubscribe";

type Item = {
  key: PrefKey;
  icon: React.ReactNode;
  label: string;
  hint: string;
};

const ITEMS: Item[] = [
  {
    key: "trades",
    icon: <Bell className="size-4" />,
    label: "Intercambios",
    hint: "Propuestas, aceptaciones, rechazos",
  },
  {
    key: "matches",
    icon: <Sparkles className="size-4" />,
    label: "Matches disponibles",
    hint: "Cuando alguien marca repetida que te falta",
  },
  {
    key: "digest",
    icon: <CalendarDays className="size-4" />,
    label: "Resumen semanal",
    hint: "Domingos: qué pasó en tu álbum",
  },
];

export function EmailPreferences({
  email,
  initial,
}: {
  email: string;
  initial: { trades: boolean; matches: boolean; digest: boolean };
}) {
  const [values, setValues] = React.useState(initial);
  const [pending, setPending] = React.useState<PrefKey | null>(null);

  async function onToggle(key: PrefKey, next: boolean) {
    const prev = values[key];
    setValues((v) => ({ ...v, [key]: next }));
    setPending(key);
    const r = await updateEmailPreference({ prefKey: key, enabled: next });
    setPending(null);
    if (r.error) {
      setValues((v) => ({ ...v, [key]: prev }));
      toast.error(r.error);
      return;
    }
    toast.success(next ? "Activado" : "Desactivado");
  }

  return (
    <section className="rounded-2xl border bg-card p-5 space-y-5">
      <header className="flex items-start gap-3">
        <div
          className="size-9 rounded-full grid place-items-center shrink-0"
          style={{
            backgroundColor: "color-mix(in oklab, var(--panini-blue), white 80%)",
            color: "var(--panini-blue)",
          }}
        >
          <Mail className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Notificaciones por email
          </h3>
          <p className="text-sm text-muted-foreground">
            Te avisamos a tu correo cuando pasen cosas.
          </p>
        </div>
      </header>

      <ul className="divide-y border rounded-xl overflow-hidden">
        {ITEMS.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-3 p-3.5 sm:p-4 bg-card"
          >
            <div className="size-8 rounded-md grid place-items-center bg-muted text-muted-foreground shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.hint}</p>
            </div>
            <Switch
              checked={values[item.key]}
              onCheckedChange={(v) => onToggle(item.key, v)}
              disabled={pending === item.key}
              aria-label={`${item.label} — ${values[item.key] ? "activado" : "desactivado"}`}
            />
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground border-t pt-3">
        Tu correo: <span className="font-mono">{email}</span>
      </p>
    </section>
  );
}
