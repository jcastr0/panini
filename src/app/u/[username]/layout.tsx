import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-bold tracking-tight text-lg"
          >
            Panini
            <span className="text-[var(--gold)]">·</span>
            <span className="text-[var(--panini-blue)]">JD</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 rounded-full bg-[var(--panini-blue)] text-white px-4 h-9 text-sm font-medium hover:opacity-90"
            >
              Crear cuenta <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Panini·JD · Proyecto independiente, no afiliado a Panini Group
      </footer>
    </div>
  );
}
