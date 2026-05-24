-- Seed real del Grupo E: Alemania, Curazao, Costa de Marfil, Ecuador.
-- Páginas 40-47. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id and group_code = 'E';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Alemania (40-41)
    (v_album_id, 'GER1',  1,  'Escudo de Alemania',       'Alemania', 'E', 'shiny',  2, 40),
    (v_album_id, 'GER2',  2,  'Marc-André ter Stegen',    'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER3',  3,  'Jonathan Tah',             'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER4',  4,  'David Raum',               'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER5',  5,  'Nico Schlotterbeck',       'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER6',  6,  'Antonio Rüdiger',          'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER7',  7,  'Waldemar Anton',           'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER8',  8,  'Ridle Baku',               'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER9',  9,  'Maximilian Mittelstadt',   'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER10', 10, 'Joshua Kimmich',           'Alemania', 'E', 'normal', 1, 40),
    (v_album_id, 'GER11', 11, 'Florian Wirtz',            'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER12', 12, 'Felix Nmecha',             'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER13', 13, 'Team Photo (Plantel)',     'Alemania', 'E', 'special', 2, 41),
    (v_album_id, 'GER14', 14, 'Leon Goretzka',            'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER15', 15, 'Jamal Musiala',            'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER16', 16, 'Serge Gnabry',             'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER17', 17, 'Kai Havertz',              'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER18', 18, 'Leroy Sane',               'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER19', 19, 'Karim Adeyemi',            'Alemania', 'E', 'normal', 1, 41),
    (v_album_id, 'GER20', 20, 'Nick Woltemade',           'Alemania', 'E', 'normal', 1, 41),

    -- Curazao (42-43)
    (v_album_id, 'CUW1',  1,  'Escudo de Curazao',        'Curazao', 'E', 'shiny',  2, 42),
    (v_album_id, 'CUW2',  2,  'Eloy Room',                'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW3',  3,  'Armando Obispo',           'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW4',  4,  'Sherel Floranus',          'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW5',  5,  'Jurien Gaari',             'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW6',  6,  'Joshua Brenet',            'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW7',  7,  'Roshon Van Eijma',         'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW8',  8,  'Shurandy Sambo',           'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW9',  9,  'Livano Comenencia',        'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW10', 10, 'Godfried Roemeratoe',      'Curazao', 'E', 'normal', 1, 42),
    (v_album_id, 'CUW11', 11, 'Juninho Bacuna',           'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW12', 12, 'Leandro Bacuna',           'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW13', 13, 'Team Photo (Plantel)',     'Curazao', 'E', 'special', 2, 43),
    (v_album_id, 'CUW14', 14, 'Tahith Chong',             'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW15', 15, 'Kenji Gorre',              'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW16', 16, 'Jearl Margaritha',         'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW17', 17, 'Jurgen Locadia',           'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW18', 18, 'Jeremy Antonisse',         'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW19', 19, 'Gervane Kastaneer',        'Curazao', 'E', 'normal', 1, 43),
    (v_album_id, 'CUW20', 20, 'Sontje Hansen',            'Curazao', 'E', 'normal', 1, 43),

    -- Costa de Marfil (44-45)
    (v_album_id, 'CIV1',  1,  'Escudo de Costa de Marfil', 'Costa de Marfil', 'E', 'shiny',  2, 44),
    (v_album_id, 'CIV2',  2,  'Yahia Fofana',             'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV3',  3,  'Ghislain Konan',           'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV4',  4,  'Wilfried Singo',           'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV5',  5,  'Odilon Kossounou',         'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV6',  6,  'Evan Ndicka',              'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV7',  7,  'Willy Boly',               'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV8',  8,  'Emmanuel Agbadou',         'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV9',  9,  'Ousmane Diomande',         'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV10', 10, 'Franck Kessie',            'Costa de Marfil', 'E', 'normal', 1, 44),
    (v_album_id, 'CIV11', 11, 'Seko Fofana',              'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV12', 12, 'Ibrahim Sangare',          'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV13', 13, 'Team Photo (Plantel)',     'Costa de Marfil', 'E', 'special', 2, 45),
    (v_album_id, 'CIV14', 14, 'Jean-Philippe Gbamin',     'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV15', 15, 'Amad Diallo',              'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV16', 16, 'Sébastien Haller',         'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV17', 17, 'Simon Adingra',            'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV18', 18, 'Yan Diomande',             'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV19', 19, 'Evann Guessand',           'Costa de Marfil', 'E', 'normal', 1, 45),
    (v_album_id, 'CIV20', 20, 'Oumar Diakite',            'Costa de Marfil', 'E', 'normal', 1, 45),

    -- Ecuador (46-47)
    (v_album_id, 'ECU1',  1,  'Escudo de Ecuador',        'Ecuador', 'E', 'shiny',  2, 46),
    (v_album_id, 'ECU2',  2,  'Hernán Galíndez',          'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU3',  3,  'Gonzalo Valle',            'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU4',  4,  'Piero Hincapié',           'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU5',  5,  'Pervis Estupiñán',         'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU6',  6,  'Willian Pacho',            'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU7',  7,  'Ángelo Preciado',          'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU8',  8,  'Joel Ordóñez',             'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU9',  9,  'Moises Caicedo',           'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU10', 10, 'Alan Franco',              'Ecuador', 'E', 'normal', 1, 46),
    (v_album_id, 'ECU11', 11, 'Kendry Paez',              'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU12', 12, 'Pedro Vite',               'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU13', 13, 'Team Photo (Plantel)',     'Ecuador', 'E', 'special', 2, 47),
    (v_album_id, 'ECU14', 14, 'John Yeboah',              'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU15', 15, 'Leonardo Campana',         'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU16', 16, 'Gonzalo Plata',            'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU17', 17, 'Nilson Angulo',            'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU18', 18, 'Alan Minda',               'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU19', 19, 'Kevin Rodriguez',          'Ecuador', 'E', 'normal', 1, 47),
    (v_album_id, 'ECU20', 20, 'Enner Valencia',           'Ecuador', 'E', 'normal', 1, 47);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
