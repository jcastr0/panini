import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export default async function DeletedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("deleted_at, display_name")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: { deleted_at: string | null; display_name: string | null } | null;
  };

  if (!profile?.deleted_at) redirect("/dashboard");

  const restoreDeadline = new Date(profile.deleted_at);
  restoreDeadline.setDate(restoreDeadline.getDate() + 30);

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6">
      <Trash2 className="size-16 mx-auto text-muted-foreground" />
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Cuenta eliminada
      </h1>
      <p className="text-muted-foreground">
        Tu cuenta fue eliminada de paninijd. Puedes solicitar restauración
        antes del{" "}
        <span className="font-semibold text-foreground">
          {restoreDeadline.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "America/Bogota",
          })}
        </span>{" "}
        escribiendo a{" "}
        <a href="mailto:soporte@paninijd.lat" className="underline">
          soporte@paninijd.lat
        </a>
        .
      </p>
      <p className="text-xs text-muted-foreground">
        Pasada esa fecha, tu cuenta y todo su contenido serán borrados
        permanentemente.
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
