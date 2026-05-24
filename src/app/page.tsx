import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="size-7 rounded-md bg-foreground text-background grid place-items-center font-display font-bold text-sm tracking-tighter">
              PJ
            </span>
            <span className="font-display font-bold text-lg tracking-tight">
              Panini<span className="text-[var(--panini-red)]">·</span>JD
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
              <Link href="/signup">
                Crear cuenta <ArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-12 gap-10 items-end rise">
          <div className="lg:col-span-7 space-y-7">
            <div className="flex items-center gap-3">
              <span className="eyebrow">Edición 24 · Mundial 2026</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h1 className="font-display font-bold text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-tighter">
              Completa el álbum.{" "}
              <span className="italic font-light text-muted-foreground">
                Intercambia con quien
              </span>{" "}
              <span className="relative inline-block">
                <span className="relative z-10">tenga lo que te falta.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-[var(--gold)]/40 -z-0 -rotate-1" />
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Una libreta digital para coleccionistas del Panini USA · Canadá · México 2026.
              Marca lo que tienes, mira lo que te falta, y cruza inventarios con otros
              coleccionistas en segundos.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" asChild className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
                <Link href="/signup">
                  Abrir mi álbum <ArrowUpRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild className="rounded-full">
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] relative">
              {/* Stylized stack of stickers */}
              <StickerPreview
                team="Argentina"
                num={97}
                shiny
                className="absolute top-4 left-2 rotate-[-6deg]"
              />
              <StickerPreview
                team="Colombia"
                num={641}
                className="absolute top-24 left-32 rotate-[4deg]"
              />
              <StickerPreview
                team="México"
                num={32}
                shiny
                className="absolute top-44 left-10 rotate-[-2deg]"
              />
              <StickerPreview
                team="Brasil"
                num={159}
                className="absolute top-64 left-40 rotate-[8deg]"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-b bg-[var(--card)]">
          <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-8">
            <Step
              n="01"
              title="Marca tus cromos"
              text="Cantidad por número: tenidos, repetidos y faltantes. El % se calcula solo."
            />
            <Step
              n="02"
              title="Encuentra matches"
              text="Otros coleccionistas con repetidos de lo que te falta, ordenados por compatibilidad."
            />
            <Step
              n="03"
              title="Propón el intercambio"
              text="Selecciona los cromos exactos a ofrecer y pedir. Sin chats interminables."
            />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-[var(--gold)]" />
            <p className="font-display text-2xl tracking-tight">
              792 cromos te esperan.
            </p>
          </div>
          <Button asChild size="lg" className="bg-[var(--panini-blue)] hover:bg-[var(--panini-blue)]/90">
            <Link href="/signup">
              Crear cuenta gratis <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-muted-foreground flex items-center justify-between flex-wrap gap-2">
          <span>
            Panini·JD · Proyecto independiente, no afiliado a Panini Group ·{" "}
            {new Date().getFullYear()}
          </span>
          <span className="eyebrow">Hecho con ♥ en Colombia</span>
        </div>
      </footer>
    </div>
  );
}

function StickerPreview({
  team,
  num,
  shiny,
  className,
}: {
  team: string;
  num: number;
  shiny?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative w-44 h-56 ${shiny ? "sticker-slot--shiny" : ""} sticker-slot ${shiny ? "sticker-slot--duplicate" : "sticker-slot--owned"} p-3 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <span>#{num.toString().padStart(3, "0")}</span>
        <span>{shiny ? "Shiny" : "Base"}</span>
      </div>
      <div className="mt-2 h-32 rounded bg-[color-mix(in_oklab,var(--card),var(--muted)_40%)] grid place-items-center">
        <span className="font-display text-3xl font-bold tracking-tighter">
          {team.slice(0, 3).toUpperCase()}
        </span>
      </div>
      <div className="mt-2 font-display font-semibold leading-tight">{team}</div>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="space-y-3">
      <div className="font-mono text-xs text-muted-foreground">{n}</div>
      <div className="pitch-line w-12" />
      <h3 className="font-display text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
