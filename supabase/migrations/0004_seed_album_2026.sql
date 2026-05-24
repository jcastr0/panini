-- Seed placeholder del álbum Panini Mundial 2026 (USA-Canadá-México)
-- Formato: 12 grupos (A–L), 4 equipos por grupo, 16 cromos por equipo (1 escudo shiny + 15 jugadores)
-- Total placeholder: 12 * 4 * 16 + 24 (portadas/intro) = 792 cromos
-- Estos datos son provisionales; cuando Panini publique el álbum real, reemplazar.

insert into public.albums (code, name, edition_year, total_stickers, is_active)
values ('FWC2026', 'FIFA World Cup 2026', 2026, 792, true)
on conflict (code) do update
  set name = excluded.name,
      total_stickers = excluded.total_stickers,
      is_active = excluded.is_active;

do $$
declare
  v_album_id uuid;
  v_groups text[] := array['A','B','C','D','E','F','G','H','I','J','K','L'];
  v_teams_by_group text[][] := array[
    array['Canadá','México','Estados Unidos','Equipo TBD A4'],
    array['Argentina','Equipo TBD B2','Equipo TBD B3','Equipo TBD B4'],
    array['Brasil','Equipo TBD C2','Equipo TBD C3','Equipo TBD C4'],
    array['Francia','Equipo TBD D2','Equipo TBD D3','Equipo TBD D4'],
    array['España','Equipo TBD E2','Equipo TBD E3','Equipo TBD E4'],
    array['Inglaterra','Equipo TBD F2','Equipo TBD F3','Equipo TBD F4'],
    array['Alemania','Equipo TBD G2','Equipo TBD G3','Equipo TBD G4'],
    array['Portugal','Equipo TBD H2','Equipo TBD H3','Equipo TBD H4'],
    array['Países Bajos','Equipo TBD I2','Equipo TBD I3','Equipo TBD I4'],
    array['Italia','Equipo TBD J2','Equipo TBD J3','Equipo TBD J4'],
    array['Colombia','Equipo TBD K2','Equipo TBD K3','Equipo TBD K4'],
    array['Japón','Equipo TBD L2','Equipo TBD L3','Equipo TBD L4']
  ];
  v_group text;
  v_team text;
  v_g_idx int;
  v_t_idx int;
  v_sticker_num int := 1;
  v_intro_count int := 24;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id;

  -- Cromos de intro (portada, mascota, balón, estadios, etc.)
  for i in 1..v_intro_count loop
    insert into public.stickers (album_id, number, name, team, group_code, type, rarity)
    values (v_album_id, v_sticker_num,
            case i
              when 1 then 'Portada del álbum'
              when 2 then 'Trofeo FIFA'
              when 3 then 'Mascota oficial'
              when 4 then 'Balón oficial'
              else 'Intro #' || i
            end,
            null, null,
            case when i in (1,2,3,4) then 'shiny'::sticker_type else 'normal'::sticker_type end,
            case when i in (1,2,3,4) then 3 else 1 end);
    v_sticker_num := v_sticker_num + 1;
  end loop;

  -- Por cada grupo: portada del grupo (shiny) + por cada equipo: escudo (shiny) + 15 jugadores
  for v_g_idx in 1..array_length(v_groups, 1) loop
    v_group := v_groups[v_g_idx];
    for v_t_idx in 1..4 loop
      v_team := v_teams_by_group[v_g_idx][v_t_idx];

      -- Escudo del equipo (shiny)
      insert into public.stickers (album_id, number, name, team, group_code, type, rarity)
      values (v_album_id, v_sticker_num, 'Escudo ' || v_team, v_team, v_group, 'shiny', 2);
      v_sticker_num := v_sticker_num + 1;

      -- 15 jugadores
      for p in 1..15 loop
        insert into public.stickers (album_id, number, name, team, group_code, type, rarity)
        values (v_album_id, v_sticker_num,
                v_team || ' — Jugador ' || p,
                v_team, v_group, 'normal', 1);
        v_sticker_num := v_sticker_num + 1;
      end loop;
    end loop;
  end loop;

  -- Ajustar total real
  update public.albums set total_stickers = v_sticker_num - 1 where id = v_album_id;
end $$;
