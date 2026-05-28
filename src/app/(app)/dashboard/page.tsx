import Link from "next/link";
import { ArrowRight, BookOpen, Repeat, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getActiveAlbum, getUserStats } from "@/lib/queries";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const album = await getActiveAlbum();
  const stats = user ? await getUserStats(user.id) : null;

  const { count: pendingTrades } = user
    ? await supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .eq("to_user", user.id)
        .eq("status", "pending")
    : { count: 0 };

  return (
    <div className="space-y-8">
      {/* Fan de legends */}
      <div className="relative h-52 flex justify-center items-end overflow-visible">
        {FEATURED_LEGENDS.map(({ code, alt, rotate, offset }, i) => (
          <div
            key={code}
            className="absolute w-[108px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/70 transition-transform duration-200 hover:scale-110 hover:z-10"
            style={{
              transform: `rotate(${rotate})`,
              left: `calc(50% + ${offset}px - 54px)`,
              bottom: 0,
              zIndex: i === 1 ? 3 : i + 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/laminas/LEG/${code}.jpg`}
              alt={alt}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hola, ¡bienvenido a tu álbum!
        </h1>
        <p className="text-muted-foreground mt-1">
          {album ? album.name : "No hay álbum activo"}
        </p>
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progreso del álbum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold">{stats.percent}%</div>
              <div className="text-sm text-muted-foreground">
                {stats.owned} / {stats.total} cromos
              </div>
            </div>
            <Progress value={stats.percent} />
            <div className="grid grid-cols-3 gap-4 pt-2 text-center">
              <KPI label="Tienes" value={stats.owned} />
              <KPI label="Faltan" value={stats.missing} />
              <KPI label="Repetidos" value={stats.duplicates} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <ActionCard
          href="/album"
          icon={<BookOpen className="size-5" />}
          title="Marcar cromos"
          text="Actualiza qué cromos tienes y cuántos repetidos."
        />
        <ActionCard
          href="/trades/new"
          icon={<Repeat className="size-5" />}
          title="Encontrar intercambios"
          text="Usuarios con repetidos de lo que te falta."
          badge={
            (stats?.duplicates ?? 0) > 0 ? `${stats?.duplicates} repes` : undefined
          }
        />
        <ActionCard
          href="/trades"
          icon={<Users className="size-5" />}
          title="Mis intercambios"
          text="Revisa propuestas entrantes y salientes."
          badge={pendingTrades ? `${pendingTrades} pendientes` : undefined}
        />
      </div>
    </div>
  );
}

const FEATURED_LEGENDS: { code: string; alt: string; rotate: string; offset: number }[] = [
  { code: "legarg17", alt: "Lionel Messi",     rotate: "-9deg", offset: -90 },
  { code: "legcol20", alt: "Luis Díaz",         rotate:  "1deg", offset:   0 },
  { code: "legpor15", alt: "Cristiano Ronaldo", rotate:  "9deg", offset:  90 },
];

function KPI({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  text,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  badge?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="size-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            {icon}
          </div>
          {badge && (
            <span className="text-xs font-medium rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={href}>
            Ir <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
