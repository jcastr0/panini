import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, city, country, avatar_url, is_public_profile")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-8 max-w-xl">
      <header className="space-y-3">
        <span className="eyebrow">Cuenta</span>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Tu perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Otros coleccionistas te verán por este nombre y ciudad cuando busquen
          matches.
        </p>
      </header>

      <ProfileForm
        email={user.email ?? ""}
        username={profile?.username ?? ""}
        displayName={profile?.display_name ?? ""}
        city={profile?.city ?? ""}
        country={profile?.country ?? "Colombia"}
        isPublicProfile={profile?.is_public_profile ?? true}
      />
    </div>
  );
}
