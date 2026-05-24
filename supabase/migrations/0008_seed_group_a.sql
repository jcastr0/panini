-- Seed real del Grupo A del Mundial 2026: México, Sudáfrica, Corea del Sur, República Checa.
-- 4 equipos × 20 cromos = 80 cromos. 2 páginas por equipo (10 cromos por página).

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  -- Borrar cualquier placeholder previo del Grupo A
  delete from public.stickers where album_id = v_album_id and group_code = 'A';

  -- México (páginas 8-9)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 'MEX1',  1,  'Escudo de México',         'México', 'A', 'shiny',  2, 8),
    (v_album_id, 'MEX2',  2,  'Luis Malagón',             'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX3',  3,  'Johan Vásquez',            'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX4',  4,  'Jorge Sánchez',            'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX5',  5,  'César Montes',             'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX6',  6,  'Jesús Gallardo',           'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX7',  7,  'Israel Reyes',             'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX8',  8,  'Diego Lainez',             'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX9',  9,  'Carlos Rodríguez',         'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX10', 10, 'Edson Álvarez',            'México', 'A', 'normal', 1, 8),
    (v_album_id, 'MEX11', 11, 'Orbelín Pineda',           'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX12', 12, 'Marcel Ruiz',              'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX13', 13, 'Team Photo (Plantel)',     'México', 'A', 'special', 2, 9),
    (v_album_id, 'MEX14', 14, 'Érick Sánchez',            'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX15', 15, 'Hirving Lozano',           'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX16', 16, 'Santiago Giménez',         'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX17', 17, 'Raúl Jiménez',             'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX18', 18, 'Alexis Vega',              'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX19', 19, 'Roberto Alvarado',         'México', 'A', 'normal', 1, 9),
    (v_album_id, 'MEX20', 20, 'César Huerta',             'México', 'A', 'normal', 1, 9);

  -- Sudáfrica (páginas 10-11)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 'RSA1',  1,  'Escudo de Sudáfrica',      'Sudáfrica', 'A', 'shiny',  2, 10),
    (v_album_id, 'RSA2',  2,  'Ronwen Williams',          'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA3',  3,  'Sipho Chaine',             'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA4',  4,  'Aubrey Modiba',            'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA5',  5,  'Samukele Kabini',          'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA6',  6,  'Mbekezeli Mbokazi',        'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA7',  7,  'Khulumani Ndamane',        'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA8',  8,  'Siyabonga Ngezana',        'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA9',  9,  'Khuliso Mudau',            'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA10', 10, 'Teboho Mokoena',           'Sudáfrica', 'A', 'normal', 1, 10),
    (v_album_id, 'RSA11', 11, 'Sphephelo Sithole',        'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA12', 12, 'Thapelo Morena',           'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA13', 13, 'Team Photo (Plantel)',     'Sudáfrica', 'A', 'special', 2, 11),
    (v_album_id, 'RSA14', 14, 'Themba Zwane',             'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA15', 15, 'Patrick Maswanganyi',      'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA16', 16, 'Percy Tau',                'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA17', 17, 'Oswin Appollis',           'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA18', 18, 'Iqraam Rayners',           'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA19', 19, 'Lyle Foster',              'Sudáfrica', 'A', 'normal', 1, 11),
    (v_album_id, 'RSA20', 20, 'Evidence Makgopa',         'Sudáfrica', 'A', 'normal', 1, 11);

  -- Corea del Sur (páginas 12-13)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 'KOR1',  1,  'Escudo de Corea del Sur',  'Corea del Sur', 'A', 'shiny',  2, 12),
    (v_album_id, 'KOR2',  2,  'Hyeon-woo Jo',             'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR3',  3,  'Seung-gyu Kim',            'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR4',  4,  'Min-jae Kim',              'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR5',  5,  'Young-gwon Kim',           'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR6',  6,  'Jin-su Kim',               'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR7',  7,  'Young-woo Seol',           'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR8',  8,  'Seung-hyun Jung',          'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR9',  9,  'Myung-jae Lee',            'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR10', 10, 'Woo-young Jung',           'Corea del Sur', 'A', 'normal', 1, 12),
    (v_album_id, 'KOR11', 11, 'In-beom Hwang',            'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR12', 12, 'Kang-in Lee',              'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR13', 13, 'Team Photo (Plantel)',     'Corea del Sur', 'A', 'special', 2, 13),
    (v_album_id, 'KOR14', 14, 'Seung-ho Paik',            'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR15', 15, 'Jens Castrop',             'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR16', 16, 'Dong-gyeong Lee',          'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR17', 17, 'Gue-sung Cho',             'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR18', 18, 'Heung-min Son',            'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR19', 19, 'Hee-chan Hwang',           'Corea del Sur', 'A', 'normal', 1, 13),
    (v_album_id, 'KOR20', 20, 'Hyeon-gyu Oh',             'Corea del Sur', 'A', 'normal', 1, 13);

  -- República Checa (páginas 14-15)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    (v_album_id, 'CZE1',  1,  'Escudo de República Checa', 'República Checa', 'A', 'shiny',  2, 14),
    (v_album_id, 'CZE2',  2,  'Matej Kovar',               'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE3',  3,  'Jindrich Stanek',           'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE4',  4,  'Ladislav Krejci',           'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE5',  5,  'Vladimir Coufal',           'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE6',  6,  'Jaroslav Zeleny',           'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE7',  7,  'Tomas Holes',               'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE8',  8,  'David Zima',                'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE9',  9,  'Michal Sadilek',            'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE10', 10, 'Tomas Soucek',              'República Checa', 'A', 'normal', 1, 14),
    (v_album_id, 'CZE11', 11, 'Antonin Barak',             'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE12', 12, 'Lukas Provod',              'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE13', 13, 'Team Photo (Plantel)',      'República Checa', 'A', 'special', 2, 15),
    (v_album_id, 'CZE14', 14, 'Ondrej Lingr',              'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE15', 15, 'Vaclav Cerny',              'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE16', 16, 'Adam Hlozek',               'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE17', 17, 'Patrik Schick',             'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE18', 18, 'Jan Kuchta',                'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE19', 19, 'Mojmir Chytil',             'República Checa', 'A', 'normal', 1, 15),
    (v_album_id, 'CZE20', 20, 'Tomas Chory',               'República Checa', 'A', 'normal', 1, 15);

  -- Recalcular total
  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
