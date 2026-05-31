import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./_layout";

export function TradeRejectedEmail({
  recipientName,
  rejecterName,
  newMatchesUrl,
  unsubscribeUrl,
}: {
  recipientName: string;
  rejecterName: string;
  newMatchesUrl: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      title="Tu propuesta fue rechazada"
      preview={`${rejecterName} rechazó tu propuesta — busca otro match`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#3a466b", margin: "0 0 16px" }}>
        ¡Hola <strong>{recipientName}</strong>! Esta vez no se concretó:{" "}
        <strong>{rejecterName}</strong> no pudo aceptar el intercambio. Pero
        siempre hay otros coleccionistas con repetidos que te interesan.
      </Text>

      <Text style={{ margin: "20px 0 0" }}>
        <Button
          href={newMatchesUrl}
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
          Buscar otros matches
        </Button>
      </Text>
    </EmailLayout>
  );
}
