-- Renombra los codes de la sección intro/historia para llevar prefijo "FWC",
-- alineándolos con la nomenclatura de las imágenes (fwc1.jpg, fwc9.jpg, etc.)
-- y haciéndolos buscables (mex10, fwc1, cc4, etc.).
--
-- EXCEPCIÓN: el cromo "00" (Logo Panini) conserva su code original — así está
-- impreso en la lámina y así lo busca la gente.
--
-- Sólo se toca la columna `code`. Los FK (user_stickers, trade_items) apuntan
-- al sticker_id (UUID), por lo que NINGUNA data de usuario se pierde ni se
-- recalcula: cantidades, repetidos, intercambios, todo intacto.
--
-- Idempotente: el filtro `code ~ '^[0-9]+$'` deja de matchear una vez aplicada.

do $$
declare
  v_album_id uuid;
  v_updated  int;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  if v_album_id is null then
    raise notice 'Album FWC2026 no encontrado, saltando rename';
    return;
  end if;

  update public.stickers
     set code = 'FWC' || code
   where album_id = v_album_id
     and group_code is null
     and team is null
     and code is not null
     and code ~ '^[0-9]+$'
     and code <> '00';

  get diagnostics v_updated = row_count;
  raise notice '0043: % codes renombrados (esperado: 19 en una corrida limpia, 0 en re-aplicación)', v_updated;
end $$;
