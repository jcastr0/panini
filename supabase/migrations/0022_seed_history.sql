-- Sección "FIFA World Cup History" (páginas 106-109): 11 cromos foil
-- conmemorativos de campeones pasados (FWC9..FWC19 → codes 9..19).
-- Comparten la sección intro (group_code IS NULL, team IS NULL).

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  -- Borrar versiones previas de estos 11 cromos por code (idempotente)
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Páginas 106-107: campeones 1934-1974
    (v_album_id, '9',  9,  'Italy 1934',         null, null, 'shiny', 3, 106),
    (v_album_id, '10', 10, 'Uruguay 1950',       null, null, 'shiny', 3, 106),
    (v_album_id, '11', 11, 'West Germany 1954',  null, null, 'shiny', 3, 107),
    (v_album_id, '12', 12, 'Brazil 1962',        null, null, 'shiny', 3, 107),
    (v_album_id, '13', 13, 'West Germany 1974',  null, null, 'shiny', 3, 107),
    -- Páginas 108-109: campeones 1986-2022
    (v_album_id, '14', 14, 'Argentina 1986',     null, null, 'shiny', 3, 108),
    (v_album_id, '15', 15, 'Brazil 1994',        null, null, 'shiny', 3, 108),
    (v_album_id, '16', 16, 'Brazil 2002',        null, null, 'shiny', 3, 108),
    (v_album_id, '17', 17, 'Italy 2006',         null, null, 'shiny', 3, 109),
    (v_album_id, '18', 18, 'Germany 2014',       null, null, 'shiny', 3, 109),
    (v_album_id, '19', 19, 'Argentina 2022',     null, null, 'shiny', 3, 109)
  on conflict (album_id, code) where code is not null
  do update set
    number      = excluded.number,
    name        = excluded.name,
    team        = excluded.team,
    group_code  = excluded.group_code,
    type        = excluded.type,
    rarity      = excluded.rarity,
    page        = excluded.page
;

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
