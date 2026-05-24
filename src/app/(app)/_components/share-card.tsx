"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareCard({
  username,
  baseUrl,
}: {
  username: string;
  baseUrl: string;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${baseUrl}/u/${username}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar el link");
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 flex items-center gap-3"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--panini-blue) 8%, var(--card)), var(--card))",
      }}
    >
      <div
        className="size-10 rounded-full grid place-items-center text-white shrink-0"
        style={{ background: "var(--panini-blue)" }}
      >
        <LinkIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Tu link público
        </div>
        <div className="text-sm font-medium truncate">{url}</div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        className="shrink-0"
      >
        {copied ? (
          <>
            <Check className="size-4 mr-1" /> Copiado
          </>
        ) : (
          <>
            <Copy className="size-4 mr-1" /> Copiar
          </>
        )}
      </Button>
    </div>
  );
}
