import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export default async function BannedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("banned_at, banned_reason, display_name, username")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: {
      banned_at: string | null;
      banned_reason: string | null;
      display_name: string | null;
      username: string | null;
    } | null;
  };

  // Si por algún motivo no está baneado, lo mandamos al app
  if (!profile?.banned_at) redirect("/dashboard");

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6">
      <ShieldAlert className="size-16 mx-auto text-[var(--panini-red)]" />
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Cuenta suspendida
      </h1>
      <p className="text-muted-foreground">
        Tu cuenta {profile.display_name || `@${profile.username}`} fue
        suspendida por la administración.
      </p>
      {profile.banned_reason && (
        <div className="border-l-4 border-[var(--panini-red)] bg-card p-4 text-left text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Razón
          </p>
          <p>{profile.banned_reason}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Si crees que es un error, escribe a{" "}
        <a href="mailto:soporte@paninijd.lat" className="underline">
          soporte@paninijd.lat
        </a>
        .
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
