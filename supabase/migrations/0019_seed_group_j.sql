-- Seed real del Grupo J: Argentina, Argelia, Austria, Jordania.
-- Páginas 80-87. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id and group_code = 'J';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Argentina (80-81)
    (v_album_id, 'ARG1',  1,  'Escudo de Argentina',      'Argentina', 'J', 'shiny',  2, 80),
    (v_album_id, 'ARG2',  2,  'Emiliano Martinez',        'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG3',  3,  'Nahuel Molina',            'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG4',  4,  'Cristian Romero',          'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG5',  5,  'Nicolas Otamendi',         'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG6',  6,  'Nicolas Tagliafico',       'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG7',  7,  'Leonardo Balerdi',         'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG8',  8,  'Enzo Fernandez',           'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG9',  9,  'Alexis Mac Allister',      'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG10', 10, 'Rodrigo De Paul',          'Argentina', 'J', 'normal', 1, 80),
    (v_album_id, 'ARG11', 11, 'Exequiel Palacios',        'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG12', 12, 'Leandro Paredes',          'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG13', 13, 'Team Photo (Plantel)',     'Argentina', 'J', 'special', 2, 81),
    (v_album_id, 'ARG14', 14, 'Nico Paz',                 'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG15', 15, 'Franco Mastantuono',       'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG16', 16, 'Nico Gonzalez',            'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG17', 17, 'Lionel Messi',             'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG18', 18, 'Lautaro Martinez',         'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG19', 19, 'Julian Alvarez',           'Argentina', 'J', 'normal', 1, 81),
    (v_album_id, 'ARG20', 20, 'Giuliano Simeone',         'Argentina', 'J', 'normal', 1, 81),

    -- Argelia (82-83)
    (v_album_id, 'ALG1',  1,  'Escudo de Argelia',        'Argelia', 'J', 'shiny',  2, 82),
    (v_album_id, 'ALG2',  2,  'Alexis Guendouz',          'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG3',  3,  'Ramy Bensebaini',          'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG4',  4,  'Youcef Atal',              'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG5',  5,  'Rayan Aït-Nouri',          'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG6',  6,  'Mohamed Amine Tougai',     'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG7',  7,  'Aïssa Mandi',              'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG8',  8,  'Ismael Bennacer',          'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG9',  9,  'Houssem Aouar',            'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG10', 10, 'Hicham Boudaoui',          'Argelia', 'J', 'normal', 1, 82),
    (v_album_id, 'ALG11', 11, 'Ramiz Zerrouki',           'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG12', 12, 'Nabil Bentaleb',           'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG13', 13, 'Team Photo (Plantel)',     'Argelia', 'J', 'special', 2, 83),
    (v_album_id, 'ALG14', 14, 'Farés Chaibi',             'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG15', 15, 'Riyad Mahrez',             'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG16', 16, 'Said Benrahma',            'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG17', 17, 'Anis Hadj Moussa',         'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG18', 18, 'Amine Gouiri',             'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG19', 19, 'Baghdad Bounedjah',        'Argelia', 'J', 'normal', 1, 83),
    (v_album_id, 'ALG20', 20, 'Mohammed Amoura',          'Argelia', 'J', 'normal', 1, 83),

    -- Austria (84-85)
    (v_album_id, 'AUT1',  1,  'Escudo de Austria',        'Austria', 'J', 'shiny',  2, 84),
    (v_album_id, 'AUT2',  2,  'Alexander Schlager',       'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT3',  3,  'Patrick Pentz',            'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT4',  4,  'David Alaba',              'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT5',  5,  'Kevin Danso',              'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT6',  6,  'Philipp Lienhart',         'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT7',  7,  'Stefan Posch',             'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT8',  8,  'Phillipp Mwene',           'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT9',  9,  'Alexander Prass',          'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT10', 10, 'Xaver Schlager',           'Austria', 'J', 'normal', 1, 84),
    (v_album_id, 'AUT11', 11, 'Marcel Sabitzer',          'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT12', 12, 'Konrad Laimer',            'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT13', 13, 'Team Photo (Plantel)',     'Austria', 'J', 'special', 2, 85),
    (v_album_id, 'AUT14', 14, 'Florian Grillitsch',       'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT15', 15, 'Nicolas Seiwald',          'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT16', 16, 'Romano Schmid',            'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT17', 17, 'Patrick Wimmer',           'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT18', 18, 'Christoph Baumgartner',    'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT19', 19, 'Michael Gregoritsch',      'Austria', 'J', 'normal', 1, 85),
    (v_album_id, 'AUT20', 20, 'Marko Arnautović',         'Austria', 'J', 'normal', 1, 85),

    -- Jordania (86-87)
    (v_album_id, 'JOR1',  1,  'Escudo de Jordania',       'Jordania', 'J', 'shiny',  2, 86),
    (v_album_id, 'JOR2',  2,  'Yazeed Abulaila',          'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR3',  3,  'Ihsan Haddad',             'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR4',  4,  'Mohammad Abu Hashish',     'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR5',  5,  'Yazan Al-Arab',            'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR6',  6,  'Abdallah Nasib',           'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR7',  7,  'Saleem Obaid',             'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR8',  8,  'Mohammad Abualnadi',       'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR9',  9,  'Ibrahim Saadeh',           'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR10', 10, 'Nizar Al-Rashdan',         'Jordania', 'J', 'normal', 1, 86),
    (v_album_id, 'JOR11', 11, 'Noor Al-Rawabdeh',         'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR12', 12, 'Mohannad Abu Taha',        'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR13', 13, 'Team Photo (Plantel)',     'Jordania', 'J', 'special', 2, 87),
    (v_album_id, 'JOR14', 14, 'Amer Jamous',              'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR15', 15, 'Musa Al-Taamari',          'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR16', 16, 'Yazan Al-Naimat',          'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR17', 17, 'Mahmoud Al-Mardi',         'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR18', 18, 'Ali Olwan',                'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR19', 19, 'Mohammad Abu Zrayq',       'Jordania', 'J', 'normal', 1, 87),
    (v_album_id, 'JOR20', 20, 'Ibrahim Sabra',            'Jordania', 'J', 'normal', 1, 87);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
