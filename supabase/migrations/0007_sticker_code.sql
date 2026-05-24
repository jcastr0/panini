-- Cada equipo numera sus cromos 1..20 internamente. Necesitamos un identificador
-- único legible por humanos (ej. MEX1, RSA15, FWC0) que no choque entre equipos.
-- 1) Quitar el unique (album_id, number) — ya no aplica.
-- 2) Agregar columna `code` y unique(album_id, code).
-- 3) Backfill de intro: code = 'FWC' || number.

alter table public.stickers
  drop constraint if exists stickers_album_id_number_key;

alter table public.stickers
  add column if not exists code text;

-- Intro: code = el número impreso ("00" para number=0, sino el número como string).
-- El prefijo "FWC" lo arreglamos definitivamente en 0010 si quedó algo viejo.
update public.stickers
   set code = case when number = 0 then '00' else number::text end
 where code is null and group_code is null and team is null;

create unique index if not exists stickers_album_code_uniq
  on public.stickers(album_id, code)
  where code is not null;

create index if not exists stickers_code_idx
  on public.stickers(code);
