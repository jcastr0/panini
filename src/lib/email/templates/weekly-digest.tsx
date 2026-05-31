import * as React from "react";
import { Button, Hr, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export type DigestStats = {
  newTrades: number;        // propuestas recibidas esta semana
  acceptedTrades: number;   // intercambios aceptados esta semana
  newPasted: number;        // cromos nuevos pegados
  newDupes: number;         // repetidos nuevos
  newMatches: number;       // matches nuevos detectados
  totalOwned: number;       // estado actual: poseídos
  totalAlbum: number;       // total del álbum
};

const ROW = {
  display: "flex",
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  padding: "8px 0",
};

export function WeeklyDigestEmail({
  recipientName,
  stats,
  albumUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  stats: DigestStats;
  albumUrl: string;
  unsubscribeUrl: string;
}) {
  const pct = stats.totalAlbum > 0
    ? Math.round((stats.totalOwned / stats.totalAlbum) * 100)
    : 0;

  return (
    <EmailLayout
      title="Tu semana en Panini·JD"
      preview={`Llevas ${pct}% del álbum · ${stats.newTrades} propuestas, ${stats.newMatches} matches nuevos`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#3a466b", margin: "0 0 16px" }}>
        ¡Hola <strong>{recipientName}</strong>! Resumen de tu semana:
      </Text>

      <Section
        style={{
          background: "linear-gradient(135deg,#1f3aa8 0%,#3155d3 100%)",
          color: "#ffffff",
          borderRadius: 14,
          padding: "20px 24px",
          margin: "0 0 20px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,.78)", margin: "0 0 4px", letterSpacing: ".22em", textTransform: "uppercase" }}>
          Tu álbum
        </Text>
        <Text style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", margin: "4px 0", lineHeight: 1 }}>
          {pct}%
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,.85)", margin: 0 }}>
          {stats.totalOwned} de {stats.totalAlbum} cromos
        </Text>
      </Section>

      <Section style={{ margin: "0 0 16px" }}>
        <Text style={{ fontSize: 13, color: "#6b7592", letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 8px" }}>
          Esta semana
        </Text>

        <table role="presentation" cellPadding="0" cellSpacing="0" width="100%" style={{ borderCollapse: "collapse" }}>
          <tbody>
            <DigestRow label="Propuestas recibidas" value={stats.newTrades} />
            <DigestRow label="Intercambios aceptados" value={stats.acceptedTrades} />
            <DigestRow label="Cromos nuevos pegados" value={stats.newPasted} />
            <DigestRow label="Repetidos nuevos" value={stats.newDupes} />
            <DigestRow label="Matches nuevos detectados" value={stats.newMatches} />
          </tbody>
        </table>
      </Section>

      <Hr style={{ borderColor: "#e3e9f5", margin: "16px 0" }} />

      <Section style={{ margin: "16px 0 8px", textAlign: "center" as const }}>
        <Button
          href={albumUrl}
          style={{
            background: "#1f3aa8",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 15,
            padding: "14px 32px",
            borderRadius: 9999,
            display: "inline-block",
          }}
        >
          Abrir mi álbum
        </Button>
      </Section>

      <Text style={{ fontSize: 12, color: "#6b7592", margin: "16px 0 0", textAlign: "center" }}>
        Llega los domingos. Si prefieres no recibirlo, desactívalo abajo o en tu perfil.
      </Text>
    </EmailLayout>
  );
}

function DigestRow({ label, value }: { label: string; value: number }) {
  return (
    <tr>
      <td style={{ padding: "8px 0", borderBottom: "1px solid #eef2fb" }}>
        <Text style={{ fontSize: 14, color: "#3a466b", margin: 0 }}>{label}</Text>
      </td>
      <td style={{ padding: "8px 0", borderBottom: "1px solid #eef2fb", textAlign: "right" as const, width: 60 }}>
        <Text style={{ fontSize: 18, fontWeight: 700, color: value > 0 ? "#1f3aa8" : "#b8bfd0", margin: 0, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </Text>
      </td>
    </tr>
  );
}
