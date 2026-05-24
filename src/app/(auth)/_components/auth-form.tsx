"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  loginAction,
  signupAction,
  signInWithGoogle,
  type AuthState,
} from "../actions";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Bienvenido de vuelta. Continúa completando tu álbum."
            : "Empieza a llevar tu colección del Mundial 2026."}
        </p>
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full" disabled={pending}>
          <GoogleIcon /> Continuar con Google
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            o con correo
          </span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? "Procesando…"
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#EA4335"
        d="M12 11v3.2h5.7c-.2 1.3-1.6 3.8-5.7 3.8-3.4 0-6.2-2.8-6.2-6.3s2.8-6.3 6.2-6.3c1.9 0 3.2.8 4 1.5l2.7-2.6C17.1 2.7 14.8 1.7 12 1.7 6.5 1.7 2 6.2 2 11.7s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
      />
    </svg>
  );
}
