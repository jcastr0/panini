import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./_components/profile-form";
import { CollectorCardUpload } from "./_components/collector-card-upload";
import { EmailPreferences } from "./_components/email-preferences";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Los tipos generados aún no conocen email_* + department; casteamos.
  const { data: profile } = (await supabase
    .from("profiles")
    .select(
      "username, display_name, city, department, country, avatar_url, is_public_profile, collector_card_base64, email_trades, email_matches, email_digest",
    )
    .eq("id", user.id)
    .maybeSingle()) as {
    data: {
      username: string | null;
      display_name: string | null;
      city: string | null;
      department: string | null;
      country: string | null;
      avatar_url: string | null;
      is_public_profile: boolean | null;
      collector_card_base64: string | null;
      email_trades: boolean | null;
      email_matches: boolean | null;
      email_digest: boolean | null;
    } | null;
  };

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
        department={profile?.department ?? null}
        isPublicProfile={profile?.is_public_profile ?? true}
      />

      <EmailPreferences
        email={user.email ?? ""}
        initial={{
          trades: profile?.email_trades ?? true,
          matches: profile?.email_matches ?? true,
          digest: profile?.email_digest ?? true,
        }}
      />
    </div>
  );
}
