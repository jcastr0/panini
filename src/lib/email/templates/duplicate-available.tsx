import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function DuplicateAvailableEmail({
  recipientName,
  ownerName,
  stickerCode,
  stickerName,
  matchCount,
  proposeUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  ownerName: string;
  stickerCode: string;
  stickerName: string;
  /** Cuántos cromos tuyos repetidos él necesita — refuerza que vale la pena. */
  matchCount: number;
  proposeUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      title={`${ownerName} tiene ${stickerCode} repetido`}
      preview={`${stickerName} podría ser tuyo · match doble con ${ownerName}`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#3a466b", margin: "0 0 16px" }}>
        ¡Hola <strong>{recipientName}</strong>! Un match doble que vale la pena:
      </Text>

      <Section
        style={{
          background: "#f4f7fc",
          borderRadius: 12,
          padding: "20px 20px",
          margin: "0 0 20px",
          textAlign: "center",
        }}
      >
        <Text style={{ fontSize: 13, color: "#6b7592", margin: "0 0 4px", letterSpacing: ".06em", textTransform: "uppercase" }}>
          Cromo disponible
        </Text>
        <Text style={{ fontSize: 22, fontWeight: 700, color: "#1f3aa8", margin: "0 0 4px", letterSpacing: ".02em" }}>
          {stickerCode}
        </Text>
        <Text style={{ fontSize: 14, color: "#3a466b", margin: 0 }}>
          {stickerName}
        </Text>
      </Section>

      <Text style={{ fontSize: 14, lineHeight: 1.6, color: "#3a466b", margin: "0 0 8px" }}>
        <strong>{ownerName}</strong> marcó este cromo como repetido y a ti te
        falta. Además, tienes <strong>{matchCount} cromo{matchCount === 1 ? "" : "s"}</strong>{" "}
        repetido{matchCount === 1 ? "" : "s"} que a él le falta{matchCount === 1 ? "" : "n"} —
        el intercambio está medio armado.
      </Text>

      <Section style={{ margin: "20px 0 8px" }}>
        <Button
          href={proposeUrl}
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
          Armar el intercambio
        </Button>
      </Section>

      <Text style={{ fontSize: 12, color: "#6b7592", margin: "16px 0 0", lineHeight: 1.5 }}>
        Los avisos esperan 30 minutos por si fue un toque sin querer — cuando
        llegan acá, es porque sí vale la pena.
      </Text>
    </EmailLayout>
  );
}
