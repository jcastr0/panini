"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Grid3x3, List, Printer } from "lucide-react";
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
import { PrintMissingDialog } from "./print-missing-dialog";

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
  /** ISO string del updated_at en user_stickers. */
  updatedAt: string | null;
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
  const [printMissingOpen, setPrintMissingOpen] = useState(false);
  const [printDupesOpen, setPrintDupesOpen] = useState(false);

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

  // Recientes: cromos pegados/actualizados en últimas 72h.
  // Si no hay nada en 72h, expandimos a 7 días.
  // Ordenados por updatedAt desc.
  const recent = useMemo(() => {
    const ownedWithDate = owned
      .filter((s) => s.updatedAt)
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    const now = Date.now();
    const T_72H = 72 * 3600 * 1000;
    const T_7D = 7 * 24 * 3600 * 1000;
    const within = (ms: number) =>
      ownedWithDate.filter(
        (s) => now - new Date(s.updatedAt!).getTime() <= ms,
      );
    const last72h = within(T_72H);
    if (last72h.length > 0) return { list: last72h, window: "72h" as const };
    return { list: within(T_7D), window: "7d" as const };
  }, [owned]);

  return (
    <Tabs defaultValue="owned" className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TabsList className="h-auto p-1 flex-wrap">
          <TabsTrigger value="owned" className="text-base py-2.5 px-4">
            Tienes ({ownedCount})
          </TabsTrigger>
          <TabsTrigger value="dupes" className="text-base py-2.5 px-4">
            Repetidos ({duplicatesCount})
          </TabsTrigger>
          <TabsTrigger value="missing" className="text-base py-2.5 px-4">
            Faltantes ({missingCount})
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-base py-2.5 px-4">
            Recientes
            {recent.list.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full px-1.5 text-[11px] font-bold bg-[var(--gold)]/20 text-[color:var(--gold)] tabular">
                {recent.list.length}
              </span>
            )}
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
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                Estos los puedes ofrecer.{" "}
                <Link
                  href="/trades/new"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Buscar matches →
                </Link>
              </p>
              <button
                type="button"
                onClick={() => setPrintDupesOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 h-9 text-sm font-medium hover:bg-muted transition-colors"
                title="Imprimir lista de repetidos con imagen — puedes omitir cromos"
              >
                <Printer className="size-4" /> Imprimir repetidos
              </button>
            </div>
            <TabBody
              stickers={dupes}
              mode={viewMode}
              variant="duplicate"
              empty="Sin repetidos."
            />
            <PrintMissingDialog
              missing={dupes}
              variant="duplicate"
              open={printDupesOpen}
              onOpenChange={setPrintDupesOpen}
            />
          </>
        )}
      </TabsContent>
      <TabsContent value="missing">
        {missing.length > 0 && (
          <div className="hidden md:flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setPrintMissingOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 h-9 text-sm font-medium hover:bg-muted transition-colors"
              title="Imprimir lista de faltantes con imagen — puedes omitir cromos"
            >
              <Printer className="size-4" /> Imprimir faltantes
            </button>
          </div>
        )}
        <TabBody
          stickers={missing}
          mode={viewMode}
          variant="missing"
          empty="¡Felicidades, lo tienes todo!"
        />
        <PrintMissingDialog
          missing={missing}
          variant="missing"
          open={printMissingOpen}
          onOpenChange={setPrintMissingOpen}
        />
      </TabsContent>
      <TabsContent value="recent">
        {recent.list.length === 0 ? (
          <Empty title="No has agregado cromos esta semana" />
        ) : (
          <RecentBody stickers={recent.list} mode={viewMode} window={recent.window} />
        )}
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
  return `${header}\n${codes.join(", ")}\n\n— www.paninijd.lat`;
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

/** Tiempo relativo en español: "hace 5 min", "hace 2 h", "hace 3 d". */
function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

/**
 * Vista cronológica plana para la pestaña "Recientes" — ordenada por
 * updatedAt desc sin agrupar por sección, con timestamp relativo.
 */
function RecentBody({
  stickers,
  mode,
  window,
}: {
  stickers: CollectionSticker[];
  mode: ViewMode;
  window: "72h" | "7d";
}) {
  // Ya viene ordenado desc desde el parent useMemo, pero por si acaso:
  const sorted = [...stickers].sort(
    (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {window === "72h"
          ? "Lo que pegaste o sumaste en las últimas 72 horas — más nuevo primero."
          : "Esta semana no pegaste nada en las últimas 72h, te muestro los últimos 7 días."}
      </p>

      {mode === "compact" ? (
        <div className="flex flex-wrap gap-1.5">
          {sorted.map((s) => (
            <div key={s.id} className="inline-flex flex-col items-start gap-0.5">
              <CodeChip
                code={s.code ?? `#${s.number}`}
                accent="var(--panini-blue)"
                variant={s.qty > 1 ? "duplicate" : "owned"}
                quantity={s.qty > 1 ? s.qty - 1 : undefined}
                shiny={s.type === "shiny" || s.type === "legend"}
              />
              {s.updatedAt && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {timeAgo(s.updatedAt)}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {sorted.map((s) => (
            <div key={s.id} className="space-y-1">
              <StickerCard
                id={s.id}
                code={s.code}
                number={s.number}
                name={s.name}
                team={s.team}
                type={s.type}
                initialQuantity={s.qty}
              />
              {s.updatedAt && (
                <p className="text-[10px] text-muted-foreground text-center font-mono">
                  {timeAgo(s.updatedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
