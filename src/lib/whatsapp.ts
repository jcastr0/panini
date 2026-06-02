/**
 * Helpers para abrir WhatsApp con mensaje precompilado.
 * wa.me espera el número en formato E.164 SIN '+' y SIN espacios.
 * Ej. '+57 300 123 4567' → '573001234567'
 */

/** Normaliza cualquier formato a solo dígitos (descarta '+', espacios, guiones, paréntesis). */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  // Validación mínima: longitud razonable (Colombia=12: 57+10, internacional≥8)
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

/** Construye URL wa.me con texto opcional encodeado. */
export function buildWhatsAppUrl(phone: string, text?: string): string | null {
  const num = normalizePhone(phone);
  if (!num) return null;
  const base = `https://wa.me/${num}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Mensaje sugerido para abrir conversación de intercambio. */
export function buildTradeProposalMessage({
  proposerName,
  tradeUrl,
  offerCount,
  requestCount,
}: {
  proposerName: string;
  tradeUrl: string;
  offerCount: number;
  requestCount: number;
}): string {
  return [
    `¡Hola! Soy ${proposerName} desde Panini·JD.`,
    "",
    `Te propongo un intercambio: te ofrezco ${offerCount} cromo${offerCount === 1 ? "" : "s"} a cambio de ${requestCount} de los tuyos.`,
    "",
    `Mira los detalles aquí: ${tradeUrl}`,
  ].join("\n");
}
