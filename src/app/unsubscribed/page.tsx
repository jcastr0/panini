import Link from "next/link";
import { ArrowRight, Check, AlertTriangle } from "lucide-react";
import { ResubscribeForm } from "./_resubscribe-form";

const PREF_LABEL: Record<string, string> = {
  trades: "Intercambios",
  matches: "Matches disponibles",
  digest: "Resumen semanal",
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; pref?: string; label?: string }>;
}) {
  const { status, pref, label } = await searchParams;

  if (status === "invalid") {
    return (
      <ErrorShell
        title="Link inválido o expirado"
        body="Si quieres ajustar tus preferencias de email, entra a tu perfil."
      />
    );
  }
  if (status === "error") {
    return (
      <ErrorShell
        title="Algo salió mal"
        body="No pudimos actualizar tu preferencia. Intenta de nuevo en un momento o desactívala desde /profile."
      />
    );
  }

  const prefLabel = label || (pref ? PREF_LABEL[pref] : "esa notificación");

  return (
    <main className="min-h-[100dvh] grid place-items-center px-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className="mx-auto size-14 rounded-full grid place-items-center"
          style={{
            backgroundColor: "color-mix(in oklab, var(--panini-blue), white 80%)",
            color: "var(--panini-blue)",
          }}
        >
          <Check className="size-7" strokeWidth={2.5} />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Listo
          </h1>
          <p className="text-muted-foreground">
            No recibirás más emails de <strong>{prefLabel}</strong>.
          </p>
        </div>

        {pref && (
          <ResubscribeForm prefKey={pref} prefLabel={prefLabel} />
        )}

        <div className="pt-4 border-t">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4"
          >
            Configurar otras notificaciones <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function ErrorShell({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-[100dvh] grid place-items-center px-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-14 rounded-full grid place-items-center bg-[var(--panini-red)]/10 text-[var(--panini-red)]">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{body}</p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline underline-offset-4"
        >
          Ir a mi perfil <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
