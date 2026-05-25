import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
        {/* Trama sutil de cromo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.10), transparent 40%)",
          }}
        />

        {/* Pelotita arriba a la derecha (guiño de JD) */}
        <div
          style={{
            position: "absolute",
            top: 50,
            right: 56,
            fontSize: 120,
            lineHeight: 1,
            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.35))",
          }}
        >
          ⚽
        </div>

        {/* Monograma PJ con punto dorado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "white",
            fontSize: 280,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: 40,
          }}
        >
          <span>P</span>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "#d4a64a",
              marginTop: 60,
              boxShadow: "0 4px 12px rgba(255,200,80,0.5)",
            }}
          />
          <span>J</span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            color: "rgba(255,255,255,0.65)",
            fontSize: 32,
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
