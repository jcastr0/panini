import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Hand,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  PartyPopper,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

type Tip = { icon: React.ReactNode; text: React.ReactNode };

type Section = {
  num: number;
  title: string;
  intro: React.ReactNode;
  imagePath?: string;
  imageAlt?: string;
  tip?: Tip;
};

const SECTIONS: Section[] = [
  {
    num: 1,
    title: "¡Bienvenido!",
    intro: (
      <>
        Este es tu álbum digital del <strong>Mundial 2026</strong>. Aquí marcas
        los cromos que tienes pegados, los repetidos para intercambiar y haces
        trades con otros coleccionistas como tú.
      </>
    ),
    imagePath: "/manual/01-dashboard.jpg",
    imageAlt: "Pantalla de inicio del álbum",
    tip: {
      icon: <Lightbulb className="size-4" />,
      text: (
        <>
          La barra inferior es tu navegación: <strong>Álbum</strong>,{" "}
          <strong>Colección</strong>, <strong>+</strong> (pegar/despegar
          rápido), <strong>Trades</strong> y <strong>Amigos</strong>.
        </>
      ),
    },
  },
  {
    num: 2,
    title: "Sube tu lámina MyPanini",
    intro: (
      <>
        Es tu carta del coleccionista. Aparece en cada sección del álbum y la
        ven tus amigos cuando visitan tu perfil. Tómate una foto bonita o
        escanea la real, recórtala estilo 3:4 y súbela una sola vez.
      </>
    ),
    imagePath: "/manual/02-perfil-mypanini.jpg",
    imageAlt: "Pantalla de perfil con upload de MyPanini",
    tip: {
      icon: <ImageIcon className="size-4" />,
      text: (
        <>
          Después puedes <strong>tocar tu lámina en cualquier hero</strong> para
          verla en grande, con efecto 3D y todo.
        </>
      ),
    },
  },
  {
    num: 3,
    title: "Tu álbum",
    intro: (
      <>
        Aquí están todas las secciones: <strong>Apertura</strong> (los primeros
        cromos del torneo), los <strong>12 grupos (A–L)</strong>,{" "}
        <strong>Historia</strong>, <strong>Coca-Cola</strong> y{" "}
        <strong>Legends</strong>. Cada tarjeta te muestra cuánto llevas.
      </>
    ),
    imagePath: "/manual/03-album-index.jpg",
    imageAlt: "Grid de secciones del álbum",
  },
  {
    num: 4,
    title: "Adentro de una sección",
    intro: (
      <>
        Cada cromo se ve como en el álbum físico: si lo tienes pegado, muestra
        la lámina real; si no, muestra una ranura vacía. Tócalo para abrirlo en
        grande.
      </>
    ),
    imagePath: "/manual/04-album-apertura.jpg",
    imageAlt: "Sección de apertura",
    tip: {
      icon: <Sparkles className="size-4" />,
      text: (
        <>
          Las láminas <strong>brillantes</strong> (shiny) tienen un halo
          dorado. Las <strong>repetidas</strong> se resaltan distinto para que
          las identifiques al ojo.
        </>
      ),
    },
  },
  {
    num: 5,
    title: "Pegar y despegar cromos",
    intro: (
      <>
        Al tocar un cromo se abre en grande con un efecto 3D. Usa el botón{" "}
        <strong>+</strong> para marcarlo como tuyo, y si te llegan más del
        mismo, sigue sumando — esos son los que puedes ofrecer.
      </>
    ),
    imagePath: "/manual/05-cromo-lightbox.jpg",
    imageAlt: "Cromo abierto con controles",
    tip: {
      icon: <Hand className="size-4" />,
      text: (
        <>
          Si tocaste sin querer, vuelve a tocarlo y dale <strong>−</strong>{" "}
          para despegar. Tu progreso no se pierde.
        </>
      ),
    },
  },
  {
    num: 6,
    title: "Tu colección",
    intro: (
      <>
        Es la vista de inventario. Tres pestañas: <strong>Tienes</strong> (todo
        lo que has pegado), <strong>Repetidos</strong> (los que puedes
        ofrecer) y <strong>Faltantes</strong> (los que necesitas).
      </>
    ),
    imagePath: "/manual/06-coleccion-tabs.jpg",
    imageAlt: "Colección con pestañas",
  },
  {
    num: 7,
    title: "Compartir tus repetidos",
    intro: (
      <>
        Cambia a vista <strong>Compacta</strong> para ver solo los códigos. El
        botón <em>Copiar</em> te arma un mensaje listo para WhatsApp con todos
        tus repetidos — para mostrarle a un amigo qué tienes.
      </>
    ),
    imagePath: "/manual/07-coleccion-repetidos-compacto.jpg",
    imageAlt: "Vista compacta de repetidos",
  },
  {
    num: 8,
    title: "Intercambios",
    intro: (
      <>
        Cuando alguien te propone un cambio, aparece aquí en{" "}
        <strong>Entrantes</strong>. Verás las laminitas que ofrecen y las que
        piden a cambio. Puedes aceptar, rechazar o responder.
      </>
    ),
    imagePath: "/manual/08-trades-entrantes.jpg",
    imageAlt: "Lista de intercambios entrantes",
  },
  {
    num: 9,
    title: "Buscar matches",
    intro: (
      <>
        El sistema calcula automáticamente con quién te conviene cambiar: la
        otra persona tiene repetidos que tú necesitas <em>y</em> a su vez le
        faltan cromos que tú tienes repetidos. Cada match trae un{" "}
        <strong>score</strong> con su potencial.
      </>
    ),
    imagePath: "/manual/09-trades-matches.jpg",
    imageAlt: "Matches de intercambio",
    tip: {
      icon: <Search className="size-4" />,
      text: (
        <>
          Las miniaturas en cada card son una preview de los cromos en juego.
          Toca <strong>Proponer intercambio</strong> para armar la propuesta.
        </>
      ),
    },
  },
  {
    num: 10,
    title: "La campana de avisos",
    intro: (
      <>
        Arriba a la derecha hay una <Bell className="inline size-4" /> campana.
        Te avisa cuando: te llega una propuesta, alguien acepta tu trade, o un
        amigo marca un cromo repetido <strong>y vale la pena cambiar contigo</strong>.
      </>
    ),
    imagePath: "/manual/10-campana-notificaciones.jpg",
    imageAlt: "Dropdown de notificaciones",
    tip: {
      icon: <Bell className="size-4" />,
      text: (
        <>
          Los avisos automáticos esperan <strong>30 minutos</strong> antes de
          dispararse, por si fue un toque sin querer. Solo te aparecen cuando
          de verdad hay <strong>match doble</strong> con la otra persona.
        </>
      ),
    },
  },
  {
    num: 11,
    title: "Visita el álbum de tus amigos",
    intro: (
      <>
        Desde <strong>Amigos</strong> puedes entrar al álbum de cualquier
        coleccionista. Verás su lámina MyPanini en cada sección y cuánto lleva
        de cada grupo. Es solo lectura — no se confunden las colecciones.
      </>
    ),
    imagePath: "/manual/12-album-amigo.jpg",
    imageAlt: "Álbum de un amigo",
    tip: {
      icon: <Users className="size-4" />,
      text: (
        <>
          Comparte tu link <code>panini.jd/u/tu_usuario</code> con tus amigos
          para que vean tu álbum y te sigan.
        </>
      ),
    },
  },
];

export default function ManualPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <header className="space-y-3">
        <Link
          href="/album"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>
        <div className="flex items-center gap-3">
          <span className="size-12 rounded-full grid place-items-center bg-[var(--panini-blue)] text-white">
            <BookOpen className="size-5" />
          </span>
          <div>
            <span className="eyebrow">Manual</span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Cómo usar tu álbum
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          Un recorrido rápido por todas las funciones. Si recién empiezas, lee
          de arriba a abajo; ya tomarás los atajos.
        </p>
      </header>

      <nav className="rounded-xl border bg-card p-4 space-y-2">
        <p className="eyebrow flex items-center gap-2">
          <ListChecks className="size-3.5" /> En este manual
        </p>
        <ol className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.num}>
              <a
                href={`#sec-${s.num}`}
                className="text-foreground/80 hover:text-[var(--panini-blue)] hover:underline underline-offset-4"
              >
                <span className="font-mono tabular text-muted-foreground mr-1.5">
                  {String(s.num).padStart(2, "0")}.
                </span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-12">
        {SECTIONS.map((s) => (
          <SectionBlock key={s.num} section={s} />
        ))}
      </div>

      <footer className="border-t pt-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-muted-foreground">
          <PartyPopper className="size-4 text-[var(--gold)]" />
          <span className="text-sm">
            ¡Eso es todo! Disfruta tu álbum y feliz Mundial.
          </span>
        </div>
        <Link
          href="/album"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 h-9 text-sm font-medium hover:opacity-90"
        >
          <LayoutGrid className="size-4" /> Ir a mi álbum
        </Link>
      </footer>
    </div>
  );
}

function SectionBlock({ section: s }: { section: Section }) {
  return (
    <section id={`sec-${s.num}`} className="space-y-4 scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span
          className="font-display font-bold text-[var(--panini-blue)] tabular leading-none"
          style={{ fontSize: "2.25rem" }}
        >
          {String(s.num).padStart(2, "0")}
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
          {s.title}
        </h2>
      </div>
      <p className="text-base text-foreground/80 leading-relaxed">{s.intro}</p>
      {s.imagePath && (
        <div className="rounded-xl overflow-hidden border bg-card relative max-w-[18rem] mx-auto">
          <Image
            src={s.imagePath}
            alt={s.imageAlt ?? ""}
            width={390}
            height={844}
            className="w-full h-auto"
            sizes="(max-width: 640px) 100vw, 18rem"
            priority={s.num <= 2}
          />
        </div>
      )}
      {s.tip && (
        <div
          className="flex items-start gap-3 rounded-lg p-3.5"
          style={{
            backgroundColor:
              "color-mix(in oklab, var(--card), var(--gold) 8%)",
            border:
              "1px solid color-mix(in oklab, var(--gold) 40%, transparent)",
          }}
        >
          <div className="size-7 rounded-full grid place-items-center text-[var(--gold)] bg-card shrink-0 mt-0.5">
            {s.tip.icon}
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            {s.tip.text}
          </p>
        </div>
      )}
    </section>
  );
}

