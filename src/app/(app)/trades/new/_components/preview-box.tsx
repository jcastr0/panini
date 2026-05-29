"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { stickerImagePath } from "@/lib/sticker-image";

export type PreviewItem = {
  id: string;
  code: string | null;
  name: string;
  team: string | null;
};

const VISIBLE_THUMBS = 4;

export function PreviewBox({
  label,
  total,
  items,
  bg,
  border,
  otherDisplayName,
}: {
  label: string;
  total: number;
  items: PreviewItem[];
  bg: string;
  border: string;
  /** Nombre del coleccionista del otro lado — para encabezar el dialog */
  otherDisplayName: string;
}) {
  const visible = items.slice(0, VISIBLE_THUMBS);
  const extra = Math.max(0, total - VISIBLE_THUMBS);
  const hasExtras = extra > 0 && items.length > VISIBLE_THUMBS;

  return (
    <div
      className="rounded-md p-2.5 border space-y-2"
      style={{
        backgroundColor: `color-mix(in ${bg})`,
        borderColor: `color-mix(in ${border})`,
      }}
    >
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{label}</p>
        <p className="font-display text-base font-bold tabular">{total}</p>
      </div>
      {visible.length > 0 ? (
        <div className="grid grid-cols-4 gap-1">
          {visible.map((s) => (
            <Thumb key={s.id} item={s} />
          ))}
          {hasExtras ? (
            <ExtraDialog
              extra={extra}
              items={items}
              label={label}
              otherDisplayName={otherDisplayName}
            />
          ) : extra > 0 ? (
            <div
              className="aspect-[3/4] rounded bg-card ring-1 ring-border grid place-items-center"
              title={`+${extra} cromos más`}
            >
              <span className="font-mono text-[11px] font-semibold tabular text-muted-foreground">
                +{extra}
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">Sin previa</p>
      )}
    </div>
  );
}

function Thumb({ item: s }: { item: PreviewItem }) {
  const img = stickerImagePath(s.code);
  return (
    <div
      title={`${s.code ?? ""} · ${s.team ?? s.name}`}
      className="relative aspect-[3/4] rounded overflow-hidden bg-muted ring-1 ring-border"
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="size-full grid place-items-center">
          <span className="font-mono text-[7px] text-muted-foreground">{s.code}</span>
        </div>
      )}
    </div>
  );
}

function ExtraDialog({
  extra,
  items,
  label,
  otherDisplayName,
}: {
  extra: number;
  items: PreviewItem[];
  label: string;
  otherDisplayName: string;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={`Ver los ${extra} cromos restantes`}
            className="aspect-[3/4] rounded bg-card ring-1 ring-border hover:bg-muted active:scale-95 grid place-items-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-mono text-[11px] font-semibold tabular text-foreground">
              +{extra}
            </span>
          </button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "duration-200",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[min(560px,94vw)] max-h-[88vh] flex flex-col",
            "bg-card border rounded-2xl shadow-2xl overflow-hidden outline-none",
            "duration-200",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <header className="px-5 py-4 border-b flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display text-lg font-semibold tracking-tight truncate">
                {label}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-muted-foreground truncate">
                {items.length} cromos · {otherDisplayName}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Cerrar"
              className="size-9 rounded-full grid place-items-center hover:bg-muted shrink-0 transition-colors"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </header>
          <div className="overflow-y-auto p-4">
            <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((s) => {
                const img = stickerImagePath(s.code);
                return (
                  <li
                    key={s.id}
                    className="border rounded-lg overflow-hidden bg-card"
                  >
                    <div className="relative aspect-[3/4] bg-muted">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={s.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full grid place-items-center">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {s.code}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-1.5 py-1 border-t">
                      <p className="text-[10px] font-mono text-muted-foreground truncate">
                        {s.code ?? "—"}
                      </p>
                      <p className="text-[11px] font-medium truncate leading-tight">
                        {s.team ?? s.name}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
