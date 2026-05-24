"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ImagePlus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  removeCollectorCard,
  uploadCollectorCard,
  type UploadState,
} from "../collector-card-actions";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function CollectorCardUpload({
  current,
  username,
}: {
  current: string | null;
  username: string;
}) {
  const [state, action, pending] = useActionState<UploadState, FormData>(
    uploadCollectorCard,
    {},
  );
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(
        state.sizeKB
          ? `Lámina guardada (${state.sizeKB} KB).`
          : "Lámina guardada.",
      );
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [state]);

  function onChoose(file: File | null) {
    setLocalError(null);
    if (!file) {
      setPreview(null);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setLocalError("Formato no soportado. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setLocalError(
        `Pesa ${(file.size / 1024 / 1024).toFixed(1)} MB · el máximo es 3 MB.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
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
        <div
          className="w-32 sm:w-40 aspect-[3/4] rounded-xl border bg-muted/40 overflow-hidden shrink-0 grid place-items-center text-muted-foreground"
        >
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

        <form action={action} className="flex-1 space-y-3">
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onChoose(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-border file:bg-background file:text-sm file:font-medium file:cursor-pointer hover:file:bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP · máx 3 MB · la procesamos a JPEG ≤300 KB
          </p>

          {(localError || state.error) && (
            <Alert variant="destructive">
              <AlertDescription>{localError || state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending || !!localError}>
              {pending ? (
                "Procesando…"
              ) : (
                <>
                  <Upload className="size-4 mr-1" />
                  {current ? "Cambiar" : "Subir"}
                </>
              )}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview(null);
                  setLocalError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <X className="size-4 mr-1" /> Cancelar
              </Button>
            )}
            {current && !preview && (
              <Button type="button" variant="outline" onClick={handleRemove}>
                <Trash2 className="size-4 mr-1" /> Quitar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
