import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./_components/profile-form";
import { CollectorCardUpload } from "./_components/collector-card-upload";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, display_name, city, country, avatar_url, is_public_profile, collector_card_base64",
    )
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
          Tu nombre y lámina aparecen en cada sección del álbum.
        </p>
      </header>

      <CollectorCardUpload
        current={profile?.collector_card_base64 ?? null}
        username={profile?.username ?? ""}
        userId={user.id}
      />

      <Link
        href="/amigos"
        className="flex items-center gap-3 rounded-xl border p-4 hover:bg-muted/40 transition-colors"
      >
        <div
          className="size-10 rounded-full grid place-items-center text-white shrink-0"
          style={{ background: "var(--panini-blue)" }}
        >
          <Users className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display font-semibold">Buscar coleccionistas</div>
          <div className="text-xs text-muted-foreground">
            Encuentra amigos por @username y comparte tu link público
          </div>
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
      </Link>

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
