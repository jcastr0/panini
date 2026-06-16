-- Búsqueda de stickers ignorando acentos.
-- Antes: ilike normal en team/name no encontraba "Irán" al buscar "iran",
-- ni "México" buscando "mexico". Postgres ilike es case-insensitive pero
-- NO accent-insensitive.
--
-- Solución: extension unaccent + RPC que normaliza query y columnas.

create extension if not exists unaccent;

-- Función inmutable para indexar (unaccent es STABLE pero immutable wrapper
-- lo hace usable en índices). Por ahora no creamos índice — la tabla
-- stickers tiene ~1000 filas, full scan es trivial.
create or replace function public.search_stickers(p_q text)
returns table(
  id uuid,
  code text,
  team text,
  group_code text,
  type text,
  page int,
  number int,
  name text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.code, s.team, s.group_code, s.type, s.page, s.number, s.name
    from public.stickers s
    join public.albums a on a.id = s.album_id and a.is_active = true
   where
     -- Match por code (exact start, sin acentos no relevante)
     upper(coalesce(s.code, '')) like upper(regexp_replace(p_q, '[\s-]', '', 'g')) || '%'
     or
     -- Match accent-insensitive en name
     unaccent(lower(coalesce(s.name, ''))) like '%' || unaccent(lower(p_q)) || '%'
     or
     -- Match accent-insensitive en team
     unaccent(lower(coalesce(s.team, ''))) like '%' || unaccent(lower(p_q)) || '%'
   limit 30;
$$;

grant execute on function public.search_stickers(text) to authenticated;
