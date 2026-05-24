-- LEY del proyecto: cero pérdida de datos de usuario al re-aplicar migraciones.
--
-- Antes: user_stickers.sticker_id tenía ON DELETE CASCADE. Cuando los seeds
-- (0008, 0009, etc.) hacían DELETE+INSERT en stickers para "refrescar" el
-- catálogo, los user_stickers que apuntaban a esos stickers eran borrados
-- en cascada. Resultado: pérdida de colecciones reales (caso @jdavid).
--
-- Después de esta migración:
--   1) user_stickers.sticker_id queda como ON DELETE RESTRICT — cualquier
--      DELETE accidental sobre stickers referenciados fallará LOUD en vez
--      de borrar silenciosamente la colección del usuario.
--   2) Los seeds 0004-0023 ya no usan DELETE; usan UPSERT por (album_id, code)
--      para preservar UUIDs (ver commit asociado).
--   3) Esta migración hace una limpieza segura de stickers placeholder
--      huérfanos que quedaron de 0004 — solo borra los que NO tienen
--      ningún user_sticker apuntándoles.

-- Paso 1: limpieza segura ANTES de cambiar el FK (mientras todavía es CASCADE,
-- por si acaso, hacemos delete condicional con anti-join — no debería disparar
-- cascade porque la cláusula NOT EXISTS excluye los referenciados).
do $$
declare
  v_album_id uuid;
  v_deleted int;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  if v_album_id is null then return; end if;

  -- Placeholders huérfanos = stickers sin code O con team que arranca con "Equipo TBD",
  -- siempre que NADIE los esté usando en su colección.
  delete from public.stickers s
   where s.album_id = v_album_id
     and (s.code is null or s.team like 'Equipo TBD%')
     and not exists (
       select 1 from public.user_stickers us where us.sticker_id = s.id
     );
  get diagnostics v_deleted = row_count;
  raise notice 'Cleanup placeholders huérfanos: % filas borradas', v_deleted;
end $$;

-- Paso 2: cambiar el FK a RESTRICT
alter table public.user_stickers
  drop constraint if exists user_stickers_sticker_id_fkey;

alter table public.user_stickers
  add constraint user_stickers_sticker_id_fkey
  foreign key (sticker_id) references public.stickers(id)
  on delete restrict;

-- Recalcular total_stickers del álbum activo
update public.albums a
   set total_stickers = (select count(*) from public.stickers where album_id = a.id)
 where a.code = 'FWC2026';
