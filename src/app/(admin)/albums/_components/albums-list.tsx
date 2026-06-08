"use client";

import * as React from "react";
import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setAlbumActive, updateAlbumMeta } from "../actions";

export type AdminAlbumRow = {
  id: string;
  code: string;
  name: string;
  year: number | null;
  total_stickers: number;
  is_active: boolean;
  created_at: string;
};

export function AlbumsList({ albums }: { albums: AdminAlbumRow[] }) {
  return (
    <div className="space-y-2">
      {albums.map((a) => (
        <AlbumRow key={a.id} album={a} />
      ))}
    </div>
  );
}

function AlbumRow({ album }: { album: AdminAlbumRow }) {
  const [pending, startTransition] = useTransition();
  const [editingName, setEditingName] = React.useState(false);
  const [name, setName] = React.useState(album.name);
  const [editingYear, setEditingYear] = React.useState(false);
  const [year, setYear] = React.useState(String(album.year ?? ""));

  function toggleActive(next: boolean) {
    if (next && !album.is_active) {
      if (!confirm(`¿Cambiar el álbum activo a "${album.name}"? Esto afecta a todos los usuarios.`)) return;
    }
    startTransition(async () => {
      const res = await setAlbumActive({ album_id: album.id, active: next });
      if (res?.error) toast.error(res.error);
      else toast.success(next ? "Álbum activado" : "Álbum desactivado");
    });
  }

  function saveName() {
    if (name.trim() === album.name) {
      setEditingName(false);
      return;
    }
    startTransition(async () => {
      const res = await updateAlbumMeta({ album_id: album.id, name: name.trim() });
      if (res?.error) toast.error(res.error);
      else toast.success("Nombre actualizado");
      setEditingName(false);
    });
  }

  function saveYear() {
    const n = Number(year);
    if (!n || n === album.year) {
      setEditingYear(false);
      return;
    }
    startTransition(async () => {
      const res = await updateAlbumMeta({ album_id: album.id, year: n });
      if (res?.error) toast.error(res.error);
      else toast.success("Año actualizado");
      setEditingYear(false);
    });
  }

  return (
    <div className="border rounded-xl bg-card p-5 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px] space-y-1">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            />
            <button type="button" onClick={saveName} className="size-7 rounded-md border bg-card grid place-items-center hover:bg-muted">
              <Check className="size-3.5" />
            </button>
            <button type="button" onClick={() => { setEditingName(false); setName(album.name); }} className="size-7 rounded-md border bg-card grid place-items-center hover:bg-muted">
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingName(true)} className="text-left">
            <h2 className="font-display text-lg font-semibold tracking-tight hover:underline">
              {album.name}
            </h2>
          </button>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{album.code}</span>
          {editingYear ? (
            <div className="inline-flex items-center gap-1">
              <input
                autoFocus
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
              />
              <button type="button" onClick={saveYear} className="size-6 rounded-md border bg-card grid place-items-center hover:bg-muted">
                <Check className="size-3" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingYear(true)} className="hover:underline">
              {album.year ?? "—"}
            </button>
          )}
          <span>·</span>
          <span>{album.total_stickers} cromos</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Activo</span>
        <Switch
          checked={album.is_active}
          onCheckedChange={toggleActive}
          disabled={pending}
        />
      </div>
    </div>
  );
}
