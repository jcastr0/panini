"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationSelector, type LocationValue } from "@/components/location-selector";
import { updateProfile, type UpdateProfileState } from "../actions";

export function ProfileForm({
  email,
  username,
  displayName,
  city,
  country,
  department,
  isPublicProfile,
}: {
  email: string;
  username: string;
  displayName: string;
  city: string;
  country: string;
  department: string | null;
  isPublicProfile: boolean;
}) {
  const [location, setLocation] = useState<LocationValue>({
    country: country || "Colombia",
    department: department || null,
    city: city || "",
  });
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(
    updateProfile,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Perfil actualizado");
  }, [state.success]);

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
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

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="display_name">Nombre para mostrar</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={displayName}
          placeholder="Juan Pérez"
        />
      </div>

      <div className="space-y-3 rounded-xl border bg-muted/30 p-4 md:col-span-2">
        <p className="text-sm font-medium">Ubicación</p>
        <LocationSelector value={location} onChange={setLocation} />
        {/* Hidden inputs para que FormData reciba los valores */}
        <input type="hidden" name="country" value={location.country} />
        <input type="hidden" name="department" value={location.department ?? ""} />
        <input type="hidden" name="city" value={location.city} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer md:col-span-2">
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
        <Alert variant="destructive" className="md:col-span-2">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Guardando…" : "Guardar perfil"}
        </Button>
      </div>
    </form>
  );
}
