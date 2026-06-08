import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentUserIsAdmin } from "@/lib/admin/is-admin";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ok = await currentUserIsAdmin();
  if (!ok) notFound();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <span className="eyebrow">Panel admin</span>
          <AdminNav />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">{children}</main>
    </div>
  );
}
