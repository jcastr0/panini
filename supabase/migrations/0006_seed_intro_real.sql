-- Reemplaza el seed de intro (números 1..24, placeholder) por los cromos
-- reales del álbum Panini FIFA World Cup 2026: FWC0..FWC8 en páginas 0..3.
-- Borra y reinserta solo la sección de intro (group_code IS NULL).

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  if v_album_id is null then
    raise notice 'Álbum FWC2026 no encontrado, saltando';
    return;
  end if;

  -- Limpia cromos de intro previos (los placeholders del 0004)
  delete from public.stickers
   where album_id = v_album_id and group_code is null;

  -- Inserta los 9 cromos reales de la sección INTRO
  insert into public.stickers (album_id, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 0,  'Logo Panini',                                       null, null, 'shiny',  3, 0),
    (v_album_id, 1,  'Trofeo de la Copa Mundial de la FIFA (Superior)',   null, null, 'shiny',  3, 1),
    (v_album_id, 2,  'Trofeo de la Copa Mundial de la FIFA (Inferior)',   null, null, 'shiny',  3, 1),
    (v_album_id, 3,  'Logo Oficial FIFA World Cup 2026',                  null, null, 'shiny',  3, 2),
    (v_album_id, 4,  'Sede Canadá',                                       null, null, 'shiny',  2, 2),
    (v_album_id, 5,  'Sede Estados Unidos',                               null, null, 'shiny',  2, 2),
    (v_album_id, 6,  'Sede México',                                       null, null, 'shiny',  2, 2),
    (v_album_id, 7,  'Balón Oficial Adidas',                              null, null, 'normal', 1, 3),
    (v_album_id, 8,  'Póster Oficial del Torneo',                         null, null, 'normal', 1, 3);

  -- Recalcula total_stickers
  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
