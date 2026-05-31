import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Favicon Panini·JD — diseño que escala bien a 16/32/64 px.
 * Monograma "JD" sobre fondo azul Panini con punto dorado entre las letras.
 */
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
        {/* Brillo sutil tipo cromo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.18), transparent 45%)",
          }}
        />

        {/* Monograma JD con punto dorado */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: "white",
            fontSize: 320,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          <span>J</span>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#f4c440",
              marginTop: 80,
              boxShadow: "0 6px 16px rgba(244,196,64,0.65)",
            }}
          />
          <span>D</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
