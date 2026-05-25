import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panini·JD · Álbum del Mundial 2026",
    short_name: "Panini·JD",
    description:
      "Plataforma para coleccionistas del álbum Panini FIFA World Cup 2026: marca tus cromos, encuentra matches e intercambia con otros coleccionistas.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fcfcfd",
    theme_color: "#1f3aa5",
    categories: ["sports", "lifestyle", "social"],
    lang: "es-CO",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
