-- Seed real del Grupo G: Bélgica, Egipto, Irán, Nueva Zelanda.
-- Páginas 56-63. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Bélgica (56-57)
    (v_album_id, 'BEL1',  1,  'Escudo de Bélgica',        'Bélgica', 'G', 'shiny',  2, 56),
    (v_album_id, 'BEL2',  2,  'Thibaut Courtois',         'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL3',  3,  'Arthur Theate',            'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL4',  4,  'Timothy Castagne',         'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL5',  5,  'Zeno Debast',              'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL6',  6,  'Brandon Mechele',          'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL7',  7,  'Maxim De Cuyper',          'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL8',  8,  'Thomas Meunier',           'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL9',  9,  'Youri Tielemans',          'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL10', 10, 'Amadou Onana',             'Bélgica', 'G', 'normal', 1, 56),
    (v_album_id, 'BEL11', 11, 'Nicolas Raskin',           'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL12', 12, 'Alexis Saelemaekers',      'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL13', 13, 'Team Photo (Plantel)',     'Bélgica', 'G', 'special', 2, 57),
    (v_album_id, 'BEL14', 14, 'Hans Vanaken',             'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL15', 15, 'Kevin De Bruyne',          'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL16', 16, 'Jérémy Doku',              'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL17', 17, 'Charles De Ketelaere',     'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL18', 18, 'Leandro Trossard',         'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL19', 19, 'Loïs Openda',              'Bélgica', 'G', 'normal', 1, 57),
    (v_album_id, 'BEL20', 20, 'Romelu Lukaku',            'Bélgica', 'G', 'normal', 1, 57),

    -- Egipto (58-59)
    (v_album_id, 'EGY1',  1,  'Escudo de Egipto',         'Egipto', 'G', 'shiny',  2, 58),
    (v_album_id, 'EGY2',  2,  'Mohamed El Shenawy',       'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY3',  3,  'Mohamed Hany',             'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY4',  4,  'Mohamed Hamdy',            'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY5',  5,  'Yasser Ibrahim',           'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY6',  6,  'Khaled Sobhi',             'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY7',  7,  'Ramy Rabia',               'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY8',  8,  'Hossam Abdelmaguid',       'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY9',  9,  'Ahmed Fatouh',             'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY10', 10, 'Marwan Attia',             'Egipto', 'G', 'normal', 1, 58),
    (v_album_id, 'EGY11', 11, 'Zizo',                     'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY12', 12, 'Hamdy Fathy',              'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY13', 13, 'Team Photo (Plantel)',     'Egipto', 'G', 'special', 2, 59),
    (v_album_id, 'EGY14', 14, 'Mohamed Lasheen',          'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY15', 15, 'Emam Ashour',              'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY16', 16, 'Osama Faisal',             'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY17', 17, 'Mohamed Salah',            'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY18', 18, 'Mostafa Mohamed',          'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY19', 19, 'Trezeguet',                'Egipto', 'G', 'normal', 1, 59),
    (v_album_id, 'EGY20', 20, 'Omar Marmoush',            'Egipto', 'G', 'normal', 1, 59),

    -- Irán (60-61)
    (v_album_id, 'IRN1',  1,  'Escudo de Irán',           'Irán', 'G', 'shiny',  2, 60),
    (v_album_id, 'IRN2',  2,  'Alireza Beiranvand',       'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN3',  3,  'Morteza Pouraliganji',     'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN4',  4,  'Ehsan Hajsafi',            'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN5',  5,  'Milad Mohammadi',          'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN6',  6,  'Shojae Khalilzadeh',       'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN7',  7,  'Ramin Rezaeian',           'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN8',  8,  'Hossein Kanaani',          'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN9',  9,  'Sadegh Moharrami',         'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN10', 10, 'Saleh Hardani',            'Irán', 'G', 'normal', 1, 60),
    (v_album_id, 'IRN11', 11, 'Saeed Ezatolahi',          'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN12', 12, 'Saman Ghoddos',            'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN13', 13, 'Team Photo (Plantel)',     'Irán', 'G', 'special', 2, 61),
    (v_album_id, 'IRN14', 14, 'Omid Noorafkan',           'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN15', 15, 'Roozbeh Cheshmi',          'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN16', 16, 'Mohammad Mohebi',          'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN17', 17, 'Sardar Azmoun',            'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN18', 18, 'Mehdi Taremi',             'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN19', 19, 'Alireza Jahanbakhsh',      'Irán', 'G', 'normal', 1, 61),
    (v_album_id, 'IRN20', 20, 'Ali Gholizadeh',           'Irán', 'G', 'normal', 1, 61),

    -- Nueva Zelanda (62-63)
    (v_album_id, 'NZL1',  1,  'Escudo de Nueva Zelanda',  'Nueva Zelanda', 'G', 'shiny',  2, 62),
    (v_album_id, 'NZL2',  2,  'Max Crocombe',             'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL3',  3,  'Alex Paulsen',             'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL4',  4,  'Michael Boxall',           'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL5',  5,  'Liberato Cacace',          'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL6',  6,  'Tim Payne',                'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL7',  7,  'Tyler Bindon',             'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL8',  8,  'Francis de Vries',         'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL9',  9,  'Finn Surman',              'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL10', 10, 'Joe Bell',                 'Nueva Zelanda', 'G', 'normal', 1, 62),
    (v_album_id, 'NZL11', 11, 'Sarpreet Singh',           'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL12', 12, 'Ryan Thomas',              'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL13', 13, 'Team Photo (Plantel)',     'Nueva Zelanda', 'G', 'special', 2, 63),
    (v_album_id, 'NZL14', 14, 'Matthew Garbett',          'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL15', 15, 'Marko Stamenić',           'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL16', 16, 'Ben Old',                  'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL17', 17, 'Chris Wood',               'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL18', 18, 'Elijah Just',              'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL19', 19, 'Callum McCowatt',          'Nueva Zelanda', 'G', 'normal', 1, 63),
    (v_album_id, 'NZL20', 20, 'Kosta Barbarouses',        'Nueva Zelanda', 'G', 'normal', 1, 63)
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
