-- Sección sponsor "Coca-Cola" (páginas 110-111): 14 cromos especiales
-- con prefijo CC. Codes CC1..CC14. Tipo "special" porque no son foil
-- holográfico estándar, sino branded.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers
   where album_id = v_album_id
     and code like 'CC%';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 'CC1',  1,  'Lamine Yamal · España',          null, null, 'special', 2, 110),
    (v_album_id, 'CC2',  2,  'Joshua Kimmich · Alemania',      null, null, 'special', 2, 110),
    (v_album_id, 'CC3',  3,  'Harry Kane · Inglaterra',        null, null, 'special', 2, 110),
    (v_album_id, 'CC4',  4,  'Santiago Giménez · México',      null, null, 'special', 2, 110),
    (v_album_id, 'CC5',  5,  'Josko Gvardiol · Croacia',       null, null, 'special', 2, 110),
    (v_album_id, 'CC6',  6,  'Federico Valverde · Uruguay',    null, null, 'special', 2, 110),
    (v_album_id, 'CC7',  7,  'Jefferson Lerma · Colombia',     null, null, 'special', 2, 110),
    (v_album_id, 'CC8',  8,  'Enner Valencia · Ecuador',       null, null, 'special', 2, 111),
    (v_album_id, 'CC9',  9,  'Gabriel Magalhães · Brasil',     null, null, 'special', 2, 111),
    (v_album_id, 'CC10', 10, 'Virgil van Dijk · Países Bajos', null, null, 'special', 2, 111),
    (v_album_id, 'CC11', 11, 'Alphonso Davies · Canadá',       null, null, 'special', 2, 111),
    (v_album_id, 'CC12', 12, 'Emiliano Martínez · Argentina',  null, null, 'special', 2, 111),
    (v_album_id, 'CC13', 13, 'Raúl Jiménez · México',          null, null, 'special', 2, 111),
    (v_album_id, 'CC14', 14, 'Lautaro Martínez · Argentina',   null, null, 'special', 2, 111);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
