"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  processCollectorCardFromBlob,
  removeCollectorCard,
} from "../collector-card-actions";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — coincide con maximumSizeInBytes del endpoint
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function CollectorCardUpload({
  current,
  username,
}: {
  current: string | null;
  username: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "uploading" | "processing">(
    "idle",
  );

  function onChoose(picked: File | null) {
    setError(null);
    setFile(null);
    setPreview(null);
    if (!picked) return;

    if (!ALLOWED.includes(picked.type)) {
      setError("Formato no soportado. Usa JPG, PNG o WebP.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError(
        `Pesa ${(picked.size / 1024 / 1024).toFixed(1)} MB · el máximo es 10 MB.`,
      );
      return;
    }
    setFile(picked);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(picked);
  }

  async function handleSubmit() {
    if (!file) return;
    setError(null);
    setPhase("uploading");
    try {
      // 1. Sube directo a Vercel Blob (bypassea el límite 1MB de Server Actions)
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const blob = await upload(`${Date.now()}.${ext}`, file, {
        access: "private",
        handleUploadUrl: "/api/blob/upload",
      });

      // 2. Server action descarga, comprime con sharp y guarda en DB
      setPhase("processing");
      const fd = new FormData();
      fd.append("blobUrl", blob.url);
      const res = await processCollectorCardFromBlob({}, fd);

      if (res.error) {
        setError(res.error);
        return;
      }

      toast.success(
        res.sizeKB ? `Lámina guardada (${res.sizeKB} KB).` : "Lámina guardada.",
      );
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      // Maneja errores de red, 401, 413, abort, etc. — no deja la página colgada
      const msg = err instanceof Error ? err.message : "Error al subir";
      setError(msg);
    } finally {
      setPhase("idle");
    }
  }

  function handleRemove() {
    if (!confirm("¿Quitar la lámina?")) return;
    startTransition(async () => {
      const res = await removeCollectorCard();
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Lámina eliminada.");
      }
    });
  }

  const shown = preview ?? (current ? `data:image/jpeg;base64,${current}` : null);
  const busy = phase !== "idle" || pending;

  return (
    <div className="space-y-4 border rounded-2xl p-5 bg-card">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Tu lámina del coleccionista
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Esta imagen aparece en la portada y en cada sección del álbum, para
          que quien lo vea sepa que es de @{username}.
        </p>
      </div>

      <div className="flex gap-5 items-start">
        <div className="w-32 sm:w-40 aspect-[3/4] rounded-xl border bg-muted/40 overflow-hidden shrink-0 grid place-items-center text-muted-foreground">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt="Lámina del coleccionista"
              className="size-full object-cover"
            />
          ) : (
            <div className="text-center p-3">
              <ImagePlus className="size-7 mx-auto opacity-60" />
              <p className="text-xs mt-2">Sin lámina</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(e) => onChoose(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-border file:bg-background file:text-sm file:font-medium file:cursor-pointer hover:file:bg-muted disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP · máx 10 MB · la procesamos a JPEG ≤300 KB
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={busy || !file}
            >
              {phase === "uploading" ? (
                "Subiendo…"
              ) : phase === "processing" ? (
                "Procesando…"
              ) : (
                <>
                  <Upload className="size-4 mr-1" />
                  {current ? "Cambiar" : "Subir"}
                </>
              )}
            </Button>
            {preview && !busy && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X className="size-4 mr-1" /> Cancelar
              </Button>
            )}
            {current && !preview && !busy && (
              <Button type="button" variant="outline" onClick={handleRemove}>
                <Trash2 className="size-4 mr-1" /> Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
