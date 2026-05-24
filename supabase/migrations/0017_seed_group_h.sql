-- Seed real del Grupo H: España, Cabo Verde, Arabia Saudita, Uruguay.
-- Páginas 64-71. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- España (64-65)
    (v_album_id, 'ESP1',  1,  'Escudo de España',         'España', 'H', 'shiny',  2, 64),
    (v_album_id, 'ESP2',  2,  'Unai Simon',               'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP3',  3,  'Robin Le Normand',         'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP4',  4,  'Aymeric Laporte',          'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP5',  5,  'Dean Huijsen',             'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP6',  6,  'Pedro Porro',              'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP7',  7,  'Dani Carvajal',            'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP8',  8,  'Marc Cucurella',           'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP9',  9,  'Martín Zubimendi',         'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP10', 10, 'Rodri',                    'España', 'H', 'normal', 1, 64),
    (v_album_id, 'ESP11', 11, 'Pedri',                    'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP12', 12, 'Fabian Ruiz',              'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP13', 13, 'Team Photo (Plantel)',     'España', 'H', 'special', 2, 65),
    (v_album_id, 'ESP14', 14, 'Mikel Merino',             'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP15', 15, 'Lamine Yamal',             'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP16', 16, 'Dani Olmo',                'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP17', 17, 'Nico Williams',            'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP18', 18, 'Ferran Torres',            'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP19', 19, 'Álvaro Morata',            'España', 'H', 'normal', 1, 65),
    (v_album_id, 'ESP20', 20, 'Mikel Oyarzabal',          'España', 'H', 'normal', 1, 65),

    -- Cabo Verde (66-67)
    (v_album_id, 'CPV1',  1,  'Escudo de Cabo Verde',     'Cabo Verde', 'H', 'shiny',  2, 66),
    (v_album_id, 'CPV2',  2,  'Vozinha',                  'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV3',  3,  'Logan Costa',              'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV4',  4,  'Pico',                     'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV5',  5,  'Diney',                    'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV6',  6,  'Steven Moreira',           'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV7',  7,  'Wagner Pina',              'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV8',  8,  'Joao Paulo',               'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV9',  9,  'Yannick Semedo',           'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV10', 10, 'Kevin Pina',               'Cabo Verde', 'H', 'normal', 1, 66),
    (v_album_id, 'CPV11', 11, 'Patrick Andrade',          'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV12', 12, 'Jamiro Monteiro',          'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV13', 13, 'Team Photo (Plantel)',     'Cabo Verde', 'H', 'special', 2, 67),
    (v_album_id, 'CPV14', 14, 'Deroy Duarte',             'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV15', 15, 'Garry Rodrigues',          'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV16', 16, 'Jovane Cabral',            'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV17', 17, 'Ryan Mendes',              'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV18', 18, 'Dailon Livramento',        'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV19', 19, 'Willy Semedo',             'Cabo Verde', 'H', 'normal', 1, 67),
    (v_album_id, 'CPV20', 20, 'Bebe',                     'Cabo Verde', 'H', 'normal', 1, 67),

    -- Arabia Saudita (68-69)
    (v_album_id, 'KSA1',  1,  'Escudo de Arabia Saudita', 'Arabia Saudita', 'H', 'shiny',  2, 68),
    (v_album_id, 'KSA2',  2,  'Nawaf Alaqidi',            'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA3',  3,  'Abdulrahman Al-Sanbi',     'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA4',  4,  'Saud Abdulhamid',          'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA5',  5,  'Nawaf Bouwashl',           'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA6',  6,  'Jihad Thakri',             'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA7',  7,  'Moteb Al-Harbi',           'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA8',  8,  'Hassan Altambakti',        'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA9',  9,  'Musab Aljuwayr',           'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA10', 10, 'Ziyad Aljohani',           'Arabia Saudita', 'H', 'normal', 1, 68),
    (v_album_id, 'KSA11', 11, 'Abdullah Alkhaibari',      'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA12', 12, 'Nasser Aldawsari',         'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA13', 13, 'Team Photo (Plantel)',     'Arabia Saudita', 'H', 'special', 2, 69),
    (v_album_id, 'KSA14', 14, 'Saleh Abu Alshamat',       'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA15', 15, 'Marwan Alsahafi',          'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA16', 16, 'Salem Aldawsari',          'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA17', 17, 'Abdulrahman Al-Aboud',     'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA18', 18, 'Feras Akbrikan',           'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA19', 19, 'Saleh Alshehri',           'Arabia Saudita', 'H', 'normal', 1, 69),
    (v_album_id, 'KSA20', 20, 'Abdullah Al-Hamdan',       'Arabia Saudita', 'H', 'normal', 1, 69),

    -- Uruguay (70-71)
    (v_album_id, 'URU1',  1,  'Escudo de Uruguay',        'Uruguay', 'H', 'shiny',  2, 70),
    (v_album_id, 'URU2',  2,  'Sergio Rochet',            'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU3',  3,  'Santiago Mele',            'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU4',  4,  'Ronald Araujo',            'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU5',  5,  'José María Giménez',       'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU6',  6,  'Sebastian Caceres',        'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU7',  7,  'Mathias Olivera',          'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU8',  8,  'Guillermo Varela',         'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU9',  9,  'Nahitan Nandez',           'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU10', 10, 'Federico Valverde',        'Uruguay', 'H', 'normal', 1, 70),
    (v_album_id, 'URU11', 11, 'Giorgian De Arrascaeta',   'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU12', 12, 'Rodrigo Bentancur',        'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU13', 13, 'Team Photo (Plantel)',     'Uruguay', 'H', 'special', 2, 71),
    (v_album_id, 'URU14', 14, 'Manuel Ugarte',            'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU15', 15, 'Nicolás de la Cruz',       'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU16', 16, 'Maxi Araujo',              'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU17', 17, 'Darwin Núñez',             'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU18', 18, 'Federico Viñas',           'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU19', 19, 'Rodrigo Aguirre',          'Uruguay', 'H', 'normal', 1, 71),
    (v_album_id, 'URU20', 20, 'Facundo Pellistri',        'Uruguay', 'H', 'normal', 1, 71)
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
