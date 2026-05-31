import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Icon iOS — al guardar "Añadir a pantalla de inicio".
 * Monograma JD + balón pequeño + año, diseñado para 180×180.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #2b4dab 0%, #1a2d6b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Brillo cromo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.18), transparent 45%)",
          }}
        />

        {/* Balón arriba-derecha */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            fontSize: 38,
            lineHeight: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
          }}
        >
          ⚽
        </div>

        {/* Monograma JD */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "white",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          <span>J</span>
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: "#f4c440",
              marginTop: 22,
              boxShadow: "0 2px 5px rgba(244,196,64,0.6)",
            }}
          />
          <span>D</span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          Álbum · 2026
        </div>
      </div>
    ),
    { ...size },
  );
}
