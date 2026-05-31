import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

/**
 * Layout compartido para todos los emails transaccionales de Panini·JD.
 * Estilo inline + table-based para compat con Gmail/Outlook/Apple Mail.
 *
 * Las páginas internas pasan:
 *  - title:   título grande del email
 *  - preview: texto que aparece en la bandeja antes de abrir (no se ve adentro)
 *  - children: contenido principal
 *  - unsubscribeUrl: URL firmada del footer
 */
export function EmailLayout({
  title,
  preview,
  unsubscribeUrl,
  children,
}: {
  title: string;
  preview: string;
  unsubscribeUrl: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body
          style={{
            margin: 0,
            padding: 0,
            background: "#eef2fb",
            fontFamily:
              "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
            color: "#16213d",
          }}
        >
          <Container
            style={{
              maxWidth: 560,
              margin: "32px auto",
              padding: 0,
              background: "#ffffff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 10px 30px -12px rgba(22,33,61,.18)",
            }}
          >
            {/* Header banda azul Panini */}
            <Section
              style={{
                background: "linear-gradient(135deg,#1f3aa8 0%,#3155d3 100%)",
                padding: "36px 32px 32px",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  margin: 0,
                  color: "#ffffff",
                }}
              >
                Panini<span style={{ color: "#f4c440" }}>·</span>
                <span style={{ color: "#ffffff" }}>JD</span>
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.78)",
                  margin: "8px 0 0",
                }}
              >
                Mundial USA · Canadá · México 2026
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ padding: "32px 32px 24px" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  margin: "0 0 16px",
                  color: "#0e1a3a",
                }}
              >
                {title}
              </Text>
              {children}
            </Section>

            {/* Footer */}
            <Section
              style={{
                padding: "20px 32px 28px",
                background: "#f4f7fc",
                borderTop: "1px solid #e3e9f5",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "#8090b3",
                  margin: "0 0 6px",
                  letterSpacing: ".04em",
                }}
              >
                Panini·JD — Proyecto independiente, no afiliado a Panini Group
              </Text>
              <Hr style={{ borderColor: "#dde4f1", margin: "10px 0" }} />
              <Text style={{ fontSize: 11, color: "#8090b3", margin: 0 }}>
                Recibes este email porque tienes una cuenta en Panini·JD.{" "}
                <Link
                  href={unsubscribeUrl}
                  style={{ color: "#1f3aa8", textDecoration: "underline" }}
                >
                  No quiero más estos avisos
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
