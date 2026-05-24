import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-sm text-center space-y-4">
      <div className="size-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
        <MailCheck className="size-7" />
      </div>
      <h1 className="text-2xl font-bold">Revisa tu correo</h1>
      <p className="text-sm text-muted-foreground">
        Te enviamos un enlace para confirmar tu cuenta. Ábrelo desde el mismo
        navegador y serás dirigido al dashboard.
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Volver a iniciar sesión</Link>
      </Button>
    </div>
  );
}
