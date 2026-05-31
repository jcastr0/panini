import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function TradeReceivedEmail({
  recipientName,
  proposerName,
  offerCount,
  requestCount,
  message,
  tradeUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  proposerName: string;
  offerCount: number;
  requestCount: number;
  message: string | null;
  tradeUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      title={`${proposerName} te propuso un intercambio`}
      preview={`${proposerName} ofrece ${offerCount} cromos a cambio de ${requestCount} tuyos`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#3a466b", margin: "0 0 16px" }}>
        ¡Hola <strong>{recipientName}</strong>! Una propuesta de intercambio
        nueva en tu álbum.
      </Text>

      <Section
        style={{
          background: "#f4f7fc",
          borderRadius: 12,
          padding: "16px 20px",
          margin: "0 0 20px",
        }}
      >
        <Text style={{ fontSize: 14, color: "#3a466b", margin: "0 0 4px" }}>
          <strong>{proposerName}</strong> te ofrece{" "}
          <strong style={{ color: "#1f3aa8" }}>
            {offerCount} cromo{offerCount === 1 ? "" : "s"}
          </strong>{" "}
          a cambio de{" "}
          <strong style={{ color: "#8a6300" }}>
            {requestCount} tuyo{requestCount === 1 ? "" : "s"}
          </strong>
          .
        </Text>
      </Section>

      {message && (
        <Section
          style={{
            borderLeft: "4px solid #1f3aa8",
            padding: "4px 0 4px 16px",
            margin: "0 0 24px",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontStyle: "italic",
              color: "#6b7592",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            “{message}”
          </Text>
        </Section>
      )}

      <Section style={{ margin: "20px 0 8px" }}>
        <Button
          href={tradeUrl}
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
          Ver la propuesta
        </Button>
      </Section>

      <Text style={{ fontSize: 12, color: "#6b7592", margin: "16px 0 0", lineHeight: 1.5 }}>
        Puedes aceptarla, rechazarla o responder con tus propios términos desde
        tu álbum.
      </Text>
    </EmailLayout>
  );
}
