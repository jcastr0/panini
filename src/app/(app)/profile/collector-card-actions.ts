"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { createClient } from "@/lib/supabase/server";

const TARGET_BYTES = 300 * 1024; // 300 KB base64 final

export type UploadState = {
  error?: string;
  success?: boolean;
  sizeKB?: number;
};

/**
 * Procesa la lámina ya subida a Vercel Blob:
 *   1. Valida que el blob pertenece a este usuario (path scope)
 *   2. Descarga el binario
 *   3. Comprime con sharp a JPEG ≤ 300 KB base64 (loop adaptativo de quality)
 *   4. Guarda el base64 en profiles.collector_card_base64
 *   5. Borra el blob temporal (era sólo un buffer de tránsito)
 */
export async function processCollectorCardFromBlob(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const blobUrl = formData.get("blobUrl");
  if (typeof blobUrl !== "string" || !blobUrl) {
    return { error: "URL del blob no recibida" };
  }

  // Guard-rail: la URL debe contener la ruta del usuario para evitar que
  // alguien suba un blob ajeno y nos haga procesarlo.
  if (!blobUrl.includes(`profile-card-temp/${user.id}/`)) {
    return { error: "URL del blob no autorizada" };
  }

  let buffer: Buffer;
  try {
    const res = await fetch(blobUrl, { cache: "no-store" });
    if (!res.ok) {
      return { error: `No se pudo descargar el blob (${res.status})` };
    }
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return { error: "Error al descargar el blob temporal" };
  }

  // Comprimir con loop adaptativo de calidad hasta caber en TARGET_BYTES base64
  let quality = 80;
  let processed: Buffer | null = null;
  let base64Bytes = Infinity;
  try {
    for (; quality >= 40; quality -= 10) {
      processed = await sharp(buffer)
        .rotate()
        .resize({ width: 600, height: 800, fit: "cover", position: "attention" })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      base64Bytes = Math.ceil(processed.length / 3) * 4;
      if (base64Bytes <= TARGET_BYTES) break;
    }
  } catch (err) {
    await safeDelete(blobUrl);
    return {
      error: err instanceof Error ? err.message : "Error procesando la imagen",
    };
  }

  if (!processed || base64Bytes > TARGET_BYTES) {
    await safeDelete(blobUrl);
    return {
      error: "No se pudo comprimir lo suficiente. Probá con otra imagen.",
    };
  }

  const base64 = processed.toString("base64");

  const { error } = await supabase
    .from("profiles")
    .update({
      collector_card_base64: base64,
      collector_card_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // Borrar el blob temporal pase lo que pase (no nos importa si falla,
  // Vercel limpia eventualmente y no es data del usuario).
  await safeDelete(blobUrl);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true, sizeKB: Math.round(base64.length / 1024) };
}

export async function removeCollectorCard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("profiles")
    .update({
      collector_card_base64: null,
      collector_card_updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

async function safeDelete(blobUrl: string) {
  try {
    await del(blobUrl);
  } catch {
    // ignore — no es crítico, blob queda como huérfano y Vercel lo recolecta
  }
}
