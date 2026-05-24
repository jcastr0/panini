-- Seed real del Grupo K: Portugal, R. D. del Congo, Uzbekistán, Colombia.
-- Páginas 88-95. 1-10 en la primera página de cada equipo, 11-20 en la segunda.
-- Nota: 0019 queda reservada para Grupo J cuando llegue.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id and group_code = 'K';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Portugal (88-89)
    (v_album_id, 'POR1',  1,  'Escudo de Portugal',       'Portugal', 'K', 'shiny',  2, 88),
    (v_album_id, 'POR2',  2,  'Diogo Costa',              'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR3',  3,  'Jose Sa',                  'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR4',  4,  'Ruben Dias',               'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR5',  5,  'João Cancelo',             'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR6',  6,  'Diogo Dalot',              'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR7',  7,  'Nuno Mendes',              'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR8',  8,  'Gonçalo Inácio',           'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR9',  9,  'Bernardo Silva',           'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR10', 10, 'Bruno Fernandes',          'Portugal', 'K', 'normal', 1, 88),
    (v_album_id, 'POR11', 11, 'Ruben Neves',              'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR12', 12, 'Vitinha',                  'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR13', 13, 'Team Photo (Plantel)',     'Portugal', 'K', 'special', 2, 89),
    (v_album_id, 'POR14', 14, 'João Neves',               'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR15', 15, 'Cristiano Ronaldo',        'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR16', 16, 'Francisco Trincao',        'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR17', 17, 'João Felix',               'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR18', 18, 'Gonçalo Ramos',            'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR19', 19, 'Pedro Neto',               'Portugal', 'K', 'normal', 1, 89),
    (v_album_id, 'POR20', 20, 'Rafael Leão',              'Portugal', 'K', 'normal', 1, 89),

    -- R. D. del Congo (90-91)
    (v_album_id, 'COD1',  1,  'Escudo de R. D. del Congo','República Democrática del Congo', 'K', 'shiny',  2, 90),
    (v_album_id, 'COD2',  2,  'Lionel Mpasi',             'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD3',  3,  'Aaron Wan-Bissaka',        'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD4',  4,  'Axel Tuanzebe',            'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD5',  5,  'Arthur Masuaku',           'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD6',  6,  'Chancel Mbemba',           'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD7',  7,  'Joris Kayembe',            'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD8',  8,  'Charles Pickel',           'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD9',  9,  'Ngal''ayel Mukau',         'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD10', 10, 'Edo Kayembe',              'República Democrática del Congo', 'K', 'normal', 1, 90),
    (v_album_id, 'COD11', 11, 'Samuel Moutoussamy',       'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD12', 12, 'Noah Sadiki',              'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD13', 13, 'Team Photo (Plantel)',     'República Democrática del Congo', 'K', 'special', 2, 91),
    (v_album_id, 'COD14', 14, 'Théo Bongonda',            'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD15', 15, 'Meschak Elia',             'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD16', 16, 'Yoane Wissa',              'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD17', 17, 'Brian Cipenga',            'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD18', 18, 'Fiston Mayele',            'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD19', 19, 'Cédric Bakambu',           'República Democrática del Congo', 'K', 'normal', 1, 91),
    (v_album_id, 'COD20', 20, 'Nathanaël Mbuku',          'República Democrática del Congo', 'K', 'normal', 1, 91),

    -- Uzbekistán (92-93)
    (v_album_id, 'UZB1',  1,  'Escudo de Uzbekistán',     'Uzbekistán', 'K', 'shiny',  2, 92),
    (v_album_id, 'UZB2',  2,  'Utkir Yusupov',            'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB3',  3,  'Farrukh Sayfiev',          'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB4',  4,  'Sherzod Nasrullaev',       'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB5',  5,  'Umar Eshmurodov',          'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB6',  6,  'Husniddin Aliqulov',       'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB7',  7,  'Rustamjon Ashurmatov',     'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB8',  8,  'Khojiakbar Alijonov',      'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB9',  9,  'Abdukodir Khusanov',       'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB10', 10, 'Odiljon Hamrobekov',       'Uzbekistán', 'K', 'normal', 1, 92),
    (v_album_id, 'UZB11', 11, 'Otabek Shukurov',          'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB12', 12, 'Jamshid Iskanderov',       'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB13', 13, 'Team Photo (Plantel)',     'Uzbekistán', 'K', 'special', 2, 93),
    (v_album_id, 'UZB14', 14, 'Azizbek Turgunboev',       'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB15', 15, 'Khojimat Erkinov',         'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB16', 16, 'Eldor Shomurodov',         'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB17', 17, 'Oston Urunov',             'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB18', 18, 'Jaloliddin Masharipov',    'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB19', 19, 'Igor Sergeev',             'Uzbekistán', 'K', 'normal', 1, 93),
    (v_album_id, 'UZB20', 20, 'Abbosbek Fayzullaev',      'Uzbekistán', 'K', 'normal', 1, 93),

    -- Colombia (94-95)
    (v_album_id, 'COL1',  1,  'Escudo de Colombia',       'Colombia', 'K', 'shiny',  2, 94),
    (v_album_id, 'COL2',  2,  'Camilo Vargas',            'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL3',  3,  'David Ospina',             'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL4',  4,  'Dávinson Sánchez',         'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL5',  5,  'Yerry Mina',               'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL6',  6,  'Daniel Munoz',             'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL7',  7,  'Johan Mojica',             'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL8',  8,  'Jhon Lucumí',              'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL9',  9,  'Santiago Arias',           'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL10', 10, 'Jefferson Lerma',          'Colombia', 'K', 'normal', 1, 94),
    (v_album_id, 'COL11', 11, 'Kevin Castaño',            'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL12', 12, 'Richard Rios',             'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL13', 13, 'Team Photo (Plantel)',     'Colombia', 'K', 'special', 2, 95),
    (v_album_id, 'COL14', 14, 'James Rodriguez',          'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL15', 15, 'Juan Fernando Quintero',   'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL16', 16, 'Jorge Carrascal',          'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL17', 17, 'Jon Arias',                'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL18', 18, 'Jhon Cordova',             'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL19', 19, 'Luis Suarez',              'Colombia', 'K', 'normal', 1, 95),
    (v_album_id, 'COL20', 20, 'Luis Diaz',                'Colombia', 'K', 'normal', 1, 95);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
