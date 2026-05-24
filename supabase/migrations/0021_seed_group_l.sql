-- Seed real del Grupo L: Inglaterra, Croacia, Ghana, Panamá.
-- Páginas 96-103. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Inglaterra (96-97)
    (v_album_id, 'ENG1',  1,  'Escudo de Inglaterra',     'Inglaterra', 'L', 'shiny',  2, 96),
    (v_album_id, 'ENG2',  2,  'Jordan Pickford',          'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG3',  3,  'John Stones',              'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG4',  4,  'Marc Guéhi',               'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG5',  5,  'Ezri Konsa',               'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG6',  6,  'Trent Alexander-Arnold',   'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG7',  7,  'Reece James',              'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG8',  8,  'Dan Burn',                 'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG9',  9,  'Jordan Henderson',         'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG10', 10, 'Declan Rice',              'Inglaterra', 'L', 'normal', 1, 96),
    (v_album_id, 'ENG11', 11, 'Jude Bellingham',          'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG12', 12, 'Cole Palmer',              'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG13', 13, 'Team Photo (Plantel)',     'Inglaterra', 'L', 'special', 2, 97),
    (v_album_id, 'ENG14', 14, 'Morgan Rogers',            'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG15', 15, 'Anthony Gordon',           'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG16', 16, 'Phil Foden',               'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG17', 17, 'Bukayo Saka',              'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG18', 18, 'Harry Kane',               'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG19', 19, 'Marcus Rashford',          'Inglaterra', 'L', 'normal', 1, 97),
    (v_album_id, 'ENG20', 20, 'Ollie Watkins',            'Inglaterra', 'L', 'normal', 1, 97),

    -- Croacia (98-99)
    (v_album_id, 'CRO1',  1,  'Escudo de Croacia',        'Croacia', 'L', 'shiny',  2, 98),
    (v_album_id, 'CRO2',  2,  'Dominik Livaković',        'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO3',  3,  'Duje Caleta-Car',          'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO4',  4,  'Josko Gvardiol',           'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO5',  5,  'Josip Stanišić',           'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO6',  6,  'Luka Vušković',            'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO7',  7,  'Josip Sutalo',             'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO8',  8,  'Kristijan Jakic',          'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO9',  9,  'Luka Modrić',              'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO10', 10, 'Mateo Kovacic',            'Croacia', 'L', 'normal', 1, 98),
    (v_album_id, 'CRO11', 11, 'Martin Baturina',          'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO12', 12, 'Lovro Majer',              'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO13', 13, 'Team Photo (Plantel)',     'Croacia', 'L', 'special', 2, 99),
    (v_album_id, 'CRO14', 14, 'Mario Pasalic',            'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO15', 15, 'Petar Sucic',              'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO16', 16, 'Ivan Perišić',             'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO17', 17, 'Marco Pasalic',            'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO18', 18, 'Ante Budimir',             'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO19', 19, 'Andrej Kramarić',          'Croacia', 'L', 'normal', 1, 99),
    (v_album_id, 'CRO20', 20, 'Franjo Ivanovic',          'Croacia', 'L', 'normal', 1, 99),

    -- Ghana (100-101)
    (v_album_id, 'GHA1',  1,  'Escudo de Ghana',          'Ghana', 'L', 'shiny',  2, 100),
    (v_album_id, 'GHA2',  2,  'Lawrence Ati Zigi',        'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA3',  3,  'Tariq Lamptey',            'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA4',  4,  'Mohammed Salisu',          'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA5',  5,  'Alidu Seidu',              'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA6',  6,  'Alexander Djiku',          'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA7',  7,  'Gideon Mensah',            'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA8',  8,  'Caleb Yirenkyi',           'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA9',  9,  'Abdul Issahaku Fatawu',    'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA10', 10, 'Thomas Partey',            'Ghana', 'L', 'normal', 1, 100),
    (v_album_id, 'GHA11', 11, 'Salis Abdul Samed',        'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA12', 12, 'Kamaldeen Sulemana',       'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA13', 13, 'Team Photo (Plantel)',     'Ghana', 'L', 'special', 2, 101),
    (v_album_id, 'GHA14', 14, 'Mohammed Kudus',           'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA15', 15, 'Inaki Williams',           'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA16', 16, 'Jordan Ayew',              'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA17', 17, 'André Ayew',               'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA18', 18, 'Joseph Paintsil',          'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA19', 19, 'Osman Bukari',             'Ghana', 'L', 'normal', 1, 101),
    (v_album_id, 'GHA20', 20, 'Antoine Semenyo',          'Ghana', 'L', 'normal', 1, 101),

    -- Panamá (102-103)
    (v_album_id, 'PAN1',  1,  'Escudo de Panamá',         'Panamá', 'L', 'shiny',  2, 102),
    (v_album_id, 'PAN2',  2,  'Orlando Mosquera',         'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN3',  3,  'Luis Mejia',               'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN4',  4,  'Fidel Escobar',            'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN5',  5,  'Andres Andrade',           'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN6',  6,  'Michael Amir Murillo',     'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN7',  7,  'Eric Davis',               'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN8',  8,  'Jose Cordoba',             'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN9',  9,  'Cesar Blackman',           'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN10', 10, 'Cristian Martinez',        'Panamá', 'L', 'normal', 1, 102),
    (v_album_id, 'PAN11', 11, 'Aníbal Godoy',             'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN12', 12, 'Adalberto Carrasquilla',   'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN13', 13, 'Team Photo (Plantel)',     'Panamá', 'L', 'special', 2, 103),
    (v_album_id, 'PAN14', 14, 'Édgar Bárcenas',           'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN15', 15, 'Carlos Harvey',            'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN16', 16, 'Ismael Díaz',              'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN17', 17, 'Jose Fajardo',             'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN18', 18, 'Cecilio Waterman',         'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN19', 19, 'Jose Luiz Rodriguez',      'Panamá', 'L', 'normal', 1, 103),
    (v_album_id, 'PAN20', 20, 'Alberto Quintero',         'Panamá', 'L', 'normal', 1, 103)
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
