"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateProfile, type UpdateProfileState } from "../actions";

export function ProfileForm({
  email,
  username,
  displayName,
  city,
  country,
  isPublicProfile,
}: {
  email: string;
  username: string;
  displayName: string;
  city: string;
  country: string;
  isPublicProfile: boolean;
}) {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Perfil actualizado");
  }, [state.success]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label>Correo</Label>
        <Input value={email} disabled readOnly />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">
          Usuario <span className="text-[var(--panini-red)]">*</span>
        </Label>
        <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring overflow-hidden">
          <span className="px-3 text-muted-foreground text-sm bg-muted py-2 font-mono">
            @
          </span>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            required
            placeholder="tuusuario"
            className="border-0 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Nombre para mostrar</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          placeholder="Juan Pérez"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            name="city"
            defaultValue={city}
            placeholder="Valledupar"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            name="country"
            defaultValue={country}
            placeholder="Colombia"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="is_public_profile"
          defaultChecked={isPublicProfile}
          className="mt-1 size-4"
        />
        <div className="space-y-0.5">
          <span className="text-sm font-medium">Perfil público</span>
          <p className="text-xs text-muted-foreground">
            Permite que otros coleccionistas te encuentren y vean tus repetidos
            para proponer intercambios.
          </p>
        </div>
      </label>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Guardando…" : "Guardar perfil"}
      </Button>
    </form>
  );
}
