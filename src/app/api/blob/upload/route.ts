import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint para que el cliente obtenga un token signed y suba el archivo
 * DIRECTO a Vercel Blob, esquivando el límite de 1 MB de body de Server
 * Actions. Sólo emitimos token si hay sesión Supabase activa.
 *
 * El archivo se sube como `profile-card-temp/<userId>/<timestamp>-<filename>`
 * y la server action `uploadCollectorCard` se encarga de:
 *   1. descargarlo, 2. comprimirlo con sharp, 3. guardarlo en DB,
 *   4. borrar el blob. El blob es 100% temporal.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No autenticado");

        // Sólo permitimos subir a la carpeta del propio usuario
        if (!pathname.startsWith(`profile-card-temp/${user.id}/`)) {
          throw new Error("Ruta no permitida");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB hard limit
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async () => {
        // No-op — el server action se encarga del cleanup.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
