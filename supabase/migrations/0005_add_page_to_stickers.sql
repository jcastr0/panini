-- Agregar columna `page` a stickers para reflejar la página real del álbum.
alter table public.stickers
  add column if not exists page int;

create index if not exists stickers_page_idx on public.stickers(album_id, page);
