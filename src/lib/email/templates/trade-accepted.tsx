import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function TradeAcceptedEmail({
  recipientName,
  accepterName,
  tradeUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  accepterName: string;
  tradeUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      title="¡Aceptaron tu propuesta!"
      preview={`${accepterName} aceptó tu propuesta de intercambio`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#3a466b", margin: "0 0 16px" }}>
        ¡Hola <strong>{recipientName}</strong>!{" "}
        <strong>{accepterName}</strong> aceptó tu propuesta de intercambio.
        Coordinen la entrega de los cromos y, cuando terminen, marca el
        intercambio como completado en la app.
      </Text>

      <Text style={{ margin: "20px 0 0" }}>
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
          Ver el intercambio
        </Button>
      </Text>
    </EmailLayout>
  );
}
