import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Panini<span className="text-emerald-600">JD</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
