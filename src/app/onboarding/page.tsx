import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si ya completó, salir
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await supabase
    .from("profiles")
    .select("country, department, city, display_name")
    .eq("id", user.id)
    .maybeSingle()) as any;

  const isComplete =
    profile?.country &&
    profile?.city &&
    profile.city.trim() !== "" &&
    (profile.country !== "Colombia" || profile.department);

  if (isComplete) redirect("/dashboard");

  return (
    <main className="min-h-[100dvh] grid place-items-center px-6 bg-background">
      <div className="max-w-md w-full space-y-6">
        <header className="space-y-2 text-center">
          <span className="eyebrow">Casi listo</span>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            ¿Dónde te encontramos?
          </h1>
          <p className="text-sm text-muted-foreground">
            Para conectar coleccionistas cercanos. Puedes editarlo después.
          </p>
        </header>

        <OnboardingForm
          initial={{
            country: profile?.country ?? "Colombia",
            department: profile?.department ?? null,
            city: profile?.city ?? "",
          }}
          displayName={profile?.display_name ?? null}
        />
      </div>
    </main>
  );
}
