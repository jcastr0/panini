import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
        {/* Pelotita guiño de JD */}
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            fontSize: 42,
            lineHeight: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
          }}
        >
          ⚽
        </div>

        {/* Monograma PJ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            color: "white",
            fontSize: 100,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          <span>P</span>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#d4a64a",
              marginTop: 22,
              boxShadow: "0 2px 4px rgba(255,200,80,0.5)",
            }}
          />
          <span>J</span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            position: "absolute",
            bottom: 18,
            color: "rgba(255,255,255,0.65)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          2026
        </div>
      </div>
    ),
    { ...size },
  );
}
