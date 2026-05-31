"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LocationSelector, type LocationValue } from "@/components/location-selector";
import { saveLocationAction } from "./actions";

export function OnboardingForm({
  initial,
  displayName,
}: {
  initial: LocationValue;
  displayName: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState<LocationValue>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    value.country.trim() !== "" &&
    value.city.trim() !== "" &&
    (value.country !== "Colombia" || (value.department && value.department.trim() !== ""));

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await saveLocationAction({
        country: value.country.trim(),
        department: value.department?.trim() || null,
        city: value.city.trim(),
      });
      if (r.error) {
        setError(r.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="rounded-2xl border bg-card p-5 space-y-5"
    >
      {displayName && (
        <p className="text-sm text-muted-foreground">
          Hola, <strong>{displayName}</strong> 👋
        </p>
      )}

      <LocationSelector value={value} onChange={setValue} disabled={pending} />

      {error && (
        <p className="text-sm text-[var(--panini-red)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || pending}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--panini-blue)] text-white h-11 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Continuar"} <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
