"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // 3 MB raw
const TARGET_BYTES = 300 * 1024; // 300 KB base64 final
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

export type UploadState = {
  error?: string;
  success?: boolean;
  sizeKB?: number;
};

export async function uploadCollectorCard(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Archivo no recibido" };
  }
  if (file.size === 0) return { error: "Archivo vacío" };
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      error: `La imagen supera 3 MB (pesa ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { error: "Formato no soportado. Usa JPG, PNG o WebP." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Procesar con sharp: orientación EXIF + resize a proporción 3:4 + JPEG comprimido
  // Loop adaptativo de calidad para garantizar ≤300 KB en base64.
  let quality = 80;
  let processed: Buffer | null = null;
  let base64Bytes = Infinity;
  for (; quality >= 40; quality -= 10) {
    processed = await sharp(buffer)
      .rotate()
      .resize({ width: 600, height: 800, fit: "cover", position: "attention" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    // base64 = ceil(bytes / 3) * 4 — estimación
    base64Bytes = Math.ceil(processed.length / 3) * 4;
    if (base64Bytes <= TARGET_BYTES) break;
  }
  if (!processed || base64Bytes > TARGET_BYTES) {
    return {
      error: "No se pudo comprimir la imagen lo suficiente. Intenta con otra.",
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
