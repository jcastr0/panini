"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Grid3x3, List } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  sectionHref,
  sectionKey as resolveSectionKey,
  sectionLabel,
  sectionPalette,
  SECTION_ORDER,
  type GroupCode,
  type SpecialKey,
} from "@/lib/album-config";
import { StickerCard } from "../../album/_components/sticker-card";
import { CodeChip } from "./code-chip";

export type CollectionSticker = {
  id: string;
  code: string | null;
  number: number;
  name: string;
  team: string | null;
  group_code: string | null;
  type: "normal" | "shiny" | "legend" | "special";
  page: number | null;
  qty: number;
};

const STORAGE_KEY = "paninijd.collection.viewMode";
type ViewMode = "visual" | "compact";

export function CollectionTabs({
  stickers,
  ownedCount,
  duplicatesCount,
  missingCount,
}: {
  stickers: CollectionSticker[];
  ownedCount: number;
  duplicatesCount: number;
  missingCount: number;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) ?? "visual") as ViewMode;
    setViewMode(saved === "compact" ? "compact" : "visual");
    setHydrated(true);
  }, []);

  function toggle() {
    const next = viewMode === "visual" ? "compact" : "visual";
    setViewMode(next);
    if (hydrated) localStorage.setItem(STORAGE_KEY, next);
  }

  const owned = useMemo(() => stickers.filter((s) => s.qty >= 1), [stickers]);
  const dupes = useMemo(() => stickers.filter((s) => s.qty > 1), [stickers]);
  const missing = useMemo(() => stickers.filter((s) => s.qty === 0), [stickers]);

  return (
    <Tabs defaultValue="owned" className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="h-auto p-1">
          <TabsTrigger value="owned" className="text-base py-2.5 px-4">
            Tienes ({ownedCount})
          </TabsTrigger>
          <TabsTrigger value="dupes" className="text-base py-2.5 px-4">
            Repetidos ({duplicatesCount})
          </TabsTrigger>
          <TabsTrigger value="missing" className="text-base py-2.5 px-4">
            Faltantes ({missingCount})
          </TabsTrigger>
        </TabsList>

        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-2 rounded-full border px-3 h-9 text-sm font-medium hover:bg-muted transition-colors"
          aria-label={
            viewMode === "visual"
              ? "Cambiar a vista compacta"
              : "Cambiar a vista visual"
          }
        >
          {viewMode === "visual" ? (
            <>
              <List className="size-4" /> Compacto
            </>
          ) : (
            <>
              <Grid3x3 className="size-4" /> Visual
            </>
          )}
        </button>
      </div>

      <TabsContent value="owned">
        <TabBody
          stickers={owned}
          mode={viewMode}
          variant="owned"
          empty="Aún no marcas cromos como tuyos."
        />
      </TabsContent>
      <TabsContent value="dupes">
        {dupes.length === 0 ? (
          <Empty title="Sin repetidos por ahora" />
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">
              Estos los puedes ofrecer.{" "}
              <Link
                href="/trades/new"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Buscar matches →
              </Link>
            </p>
            <TabBody
              stickers={dupes}
              mode={viewMode}
              variant="duplicate"
              empty="Sin repetidos."
            />
          </>
        )}
      </TabsContent>
      <TabsContent value="missing">
        <TabBody
          stickers={missing}
          mode={viewMode}
          variant="missing"
          empty="¡Felicidades, lo tienes todo!"
        />
      </TabsContent>
    </Tabs>
  );
}

function TabBody({
  stickers,
  mode,
  variant,
  empty,
}: {
  stickers: CollectionSticker[];
  mode: ViewMode;
  variant: "owned" | "duplicate" | "missing";
  empty: string;
}) {
  if (stickers.length === 0) return <Empty title={empty} />;

  // Agrupar por sección manteniendo el orden de SECTION_ORDER
  const grouped = new Map<GroupCode | SpecialKey, CollectionSticker[]>();
  stickers.forEach((s) => {
    const key = resolveSectionKey(s.group_code, s.page, s.type);
    if (key === "other") return;
    const k = key as GroupCode | SpecialKey;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(s);
  });

  // Calcular lista plana ordenada para "copiar todo"
  const allCodes = SECTION_ORDER.flatMap((k) =>
    (grouped.get(k) ?? []).map((s) => formatCode(s, variant)),
  );

  return (
    <div className="space-y-6">
      {mode === "compact" && (
        <CopyButton
          payload={buildPayload(allCodes, variant, stickers.length)}
          label={`Copiar todo (${stickers.length})`}
        />
      )}

      {SECTION_ORDER.map((key) => {
        const list = grouped.get(key);
        if (!list || list.length === 0) return null;
        const palette = sectionPalette(key);
        const codes = list.map((s) => formatCode(s, variant));
        return (
          <section
            key={key}
            className="space-y-2"
            style={
              {
                "--accent-section": palette.accent,
              } as React.CSSProperties
            }
          >
            <div className="flex items-center justify-between gap-3 border-b border-dashed pb-1">
              <Link
                href={sectionHref(key)}
                className="flex items-baseline gap-2 group"
              >
                <span
                  className="font-display text-base sm:text-lg font-semibold tracking-tight group-hover:underline underline-offset-4"
                  style={{ color: palette.accent }}
                >
                  {sectionLabel(key)}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {list.length}
                </span>
              </Link>
              {mode === "compact" && (
                <CopyButton
                  size="sm"
                  payload={buildPayload(codes, variant, list.length)}
                  label={`Copiar ${list.length}`}
                />
              )}
            </div>

            {mode === "compact" ? (
              <div className="flex flex-wrap gap-1.5">
                {list.map((s) => (
                  <CodeChip
                    key={s.id}
                    code={s.code ?? `#${s.number}`}
                    accent={palette.accent}
                    variant={variant}
                    quantity={variant === "duplicate" ? s.qty - 1 : undefined}
                    shiny={s.type === "shiny" || s.type === "legend"}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pt-2">
                {list.map((s) => (
                  <StickerCard
                    key={s.id}
                    id={s.id}
                    code={s.code}
                    number={s.number}
                    name={s.name}
                    team={s.team}
                    type={s.type}
                    initialQuantity={s.qty}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function formatCode(
  s: CollectionSticker,
  variant: "owned" | "duplicate" | "missing",
): string {
  const code = s.code ?? `#${s.number}`;
  if (variant === "duplicate" && s.qty > 1) {
    return `${code}×${s.qty - 1}`;
  }
  return code;
}

function buildPayload(
  codes: string[],
  variant: "owned" | "duplicate" | "missing",
  count: number,
): string {
  const header =
    variant === "missing"
      ? `Me faltan ${count} cromos del Mundial 2026:`
      : variant === "duplicate"
        ? `Tengo ${count} repetidos para cambio:`
        : `Tengo estos ${count} cromos:`;
  return `${header}\n${codes.join(", ")}\n\n— paninijd.vercel.app`;
}

function CopyButton({
  payload,
  label,
  size = "md",
}: {
  payload: string;
  label: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium hover:bg-muted transition-colors shrink-0",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-sm",
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5" /> Copiado
        </>
      ) : (
        <>
          <Copy className="size-3.5" /> {label}
        </>
      )}
    </button>
  );
}

function Empty({ title }: { title: string }) {
  return (
    <div className="text-center border-2 border-dashed rounded-xl py-16 px-6">
      <p className="font-display text-xl font-semibold">{title}</p>
    </div>
  );
}
