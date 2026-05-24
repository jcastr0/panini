-- Seed real del Grupo F: Países Bajos, Japón, Suecia, Túnez.
-- Páginas 48-55. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Países Bajos (48-49)
    (v_album_id, 'NED1',  1,  'Escudo de Países Bajos',   'Países Bajos', 'F', 'shiny',  2, 48),
    (v_album_id, 'NED2',  2,  'Bart Verbruggen',          'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED3',  3,  'Virgil van Dijk',          'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED4',  4,  'Micky van de Ven',         'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED5',  5,  'Jurrien Timber',           'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED6',  6,  'Denzel Dumfries',          'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED7',  7,  'Nathan Aké',               'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED8',  8,  'Jeremie Frimpong',         'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED9',  9,  'Jan Paul van Hecke',       'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED10', 10, 'Tijjani Reijnders',        'Países Bajos', 'F', 'normal', 1, 48),
    (v_album_id, 'NED11', 11, 'Ryan Gravenberch',         'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED12', 12, 'Teun Koopmeiners',         'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED13', 13, 'Team Photo (Plantel)',     'Países Bajos', 'F', 'special', 2, 49),
    (v_album_id, 'NED14', 14, 'Frenkie de Jong',          'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED15', 15, 'Xavi Simons',              'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED16', 16, 'Justin Kluivert',          'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED17', 17, 'Memphis Depay',            'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED18', 18, 'Donyell Malen',            'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED19', 19, 'Wout Weghorst',            'Países Bajos', 'F', 'normal', 1, 49),
    (v_album_id, 'NED20', 20, 'Cody Gakpo',               'Países Bajos', 'F', 'normal', 1, 49),

    -- Japón (50-51)
    (v_album_id, 'JPN1',  1,  'Escudo de Japón',          'Japón', 'F', 'shiny',  2, 50),
    (v_album_id, 'JPN2',  2,  'Zion Suzuki',              'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN3',  3,  'Henry Heroki Mochizuki',   'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN4',  4,  'Ayumu Seko',               'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN5',  5,  'Junnosuke Suzuki',         'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN6',  6,  'Shogo Taniguchi',          'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN7',  7,  'Tsuyoshi Watanabe',        'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN8',  8,  'Kaishu Sano',              'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN9',  9,  'Yuki Soma',                'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN10', 10, 'Ao Tanaka',                'Japón', 'F', 'normal', 1, 50),
    (v_album_id, 'JPN11', 11, 'Daichi Kamada',            'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN12', 12, 'Takefusa Kubo',            'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN13', 13, 'Team Photo (Plantel)',     'Japón', 'F', 'special', 2, 51),
    (v_album_id, 'JPN14', 14, 'Ritsu Doan',               'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN15', 15, 'Keito Nakamura',           'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN16', 16, 'Takumi Minamino',          'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN17', 17, 'Shuto Machino',            'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN18', 18, 'Junya Ito',                'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN19', 19, 'Koki Ogawa',               'Japón', 'F', 'normal', 1, 51),
    (v_album_id, 'JPN20', 20, 'Ayase Ueda',               'Japón', 'F', 'normal', 1, 51),

    -- Suecia (52-53)
    (v_album_id, 'SWE1',  1,  'Escudo de Suecia',         'Suecia', 'F', 'shiny',  2, 52),
    (v_album_id, 'SWE2',  2,  'Victor Johansson',         'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE3',  3,  'Isak Hien',                'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE4',  4,  'Gabriel Gudmundsson',      'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE5',  5,  'Emil Holm',                'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE6',  6,  'Victor Nilsson Lindelöf',  'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE7',  7,  'Gustaf Lagerbielke',       'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE8',  8,  'Lucas Bergvall',           'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE9',  9,  'Hugo Larsson',             'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE10', 10, 'Jesper Karlström',         'Suecia', 'F', 'normal', 1, 52),
    (v_album_id, 'SWE11', 11, 'Yasin Ayari',              'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE12', 12, 'Mattias Svanberg',         'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE13', 13, 'Team Photo (Plantel)',     'Suecia', 'F', 'special', 2, 53),
    (v_album_id, 'SWE14', 14, 'Daniel Svensson',          'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE15', 15, 'Ken Sema',                 'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE16', 16, 'Roony Bardghji',           'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE17', 17, 'Dejan Kulusevski',         'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE18', 18, 'Anthony Elanga',           'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE19', 19, 'Alexander Isak',           'Suecia', 'F', 'normal', 1, 53),
    (v_album_id, 'SWE20', 20, 'Viktor Gyökeres',          'Suecia', 'F', 'normal', 1, 53),

    -- Túnez (54-55)
    (v_album_id, 'TUN1',  1,  'Escudo de Túnez',          'Túnez', 'F', 'shiny',  2, 54),
    (v_album_id, 'TUN2',  2,  'Bechir Ben Said',          'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN3',  3,  'Aymen Dahmen',             'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN4',  4,  'Yan Valery',               'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN5',  5,  'Montassar Talbi',          'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN6',  6,  'Yassine Meriah',           'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN7',  7,  'Ali Abdi',                 'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN8',  8,  'Dylan Bronn',              'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN9',  9,  'Ellyes Skhiri',            'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN10', 10, 'Aissa Laidouni',           'Túnez', 'F', 'normal', 1, 54),
    (v_album_id, 'TUN11', 11, 'Ferjani Sassi',            'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN12', 12, 'Mohamed Ali Ben Romdhane', 'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN13', 13, 'Team Photo (Plantel)',     'Túnez', 'F', 'special', 2, 55),
    (v_album_id, 'TUN14', 14, 'Hannibal Mejbri',          'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN15', 15, 'Elias Achouri',            'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN16', 16, 'Elias Saad',               'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN17', 17, 'Hazem Mastouri',           'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN18', 18, 'Ismael Gharbi',            'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN19', 19, 'Sayfallah Ltaief',         'Túnez', 'F', 'normal', 1, 55),
    (v_album_id, 'TUN20', 20, 'Naim Sliti',               'Túnez', 'F', 'normal', 1, 55)
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
