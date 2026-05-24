-- Seed real del Grupo B: Canadá, Qatar, Bosnia y Herzegovina, Suiza.
-- Orden por páginas: Canadá (16-17), Qatar (18-19), Bosnia (20-21), Suiza (22-23).

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id and group_code = 'B';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Canadá (16-17)
    (v_album_id, 'CAN1',  1,  'Escudo de Canadá',         'Canadá', 'B', 'shiny',  2, 16),
    (v_album_id, 'CAN2',  2,  'Dayne St. Clair',          'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN3',  3,  'Alphonso Davies',          'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN4',  4,  'Alistair Johnston',        'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN5',  5,  'Samuel Adekugbe',          'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN6',  6,  'Richie Laryea',            'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN7',  7,  'Derek Cornelius',          'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN8',  8,  'Moïse Bombito',            'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN9',  9,  'Kamal Miller',             'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN10', 10, 'Stephen Eustáquio',        'Canadá', 'B', 'normal', 1, 16),
    (v_album_id, 'CAN11', 11, 'Ismaël Koné',              'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN12', 12, 'Jonathan Osorio',          'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN13', 13, 'Team Photo (Plantel)',     'Canadá', 'B', 'special', 2, 17),
    (v_album_id, 'CAN14', 14, 'Jacob Shaffelburg',        'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN15', 15, 'Mathieu Choinière',        'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN16', 16, 'Niko Sigur',               'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN17', 17, 'Tajon Buchanan',           'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN18', 18, 'Liam Millar',              'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN19', 19, 'Cyle Larin',               'Canadá', 'B', 'normal', 1, 17),
    (v_album_id, 'CAN20', 20, 'Jonathan David',           'Canadá', 'B', 'normal', 1, 17),

    -- Qatar (18-19)
    (v_album_id, 'QAT1',  1,  'Escudo de Qatar',          'Qatar', 'B', 'shiny',  2, 18),
    (v_album_id, 'QAT2',  2,  'Meshaal Barsham',          'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT3',  3,  'Sultan Albrake',           'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT4',  4,  'Lucas Mendes',             'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT5',  5,  'Homam Ahmed',              'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT6',  6,  'Boualem Khoukhi',          'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT7',  7,  'Pedro Miguel',             'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT8',  8,  'Tarek Salman',             'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT9',  9,  'Mohamed Al-Mannai',        'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT10', 10, 'Karim Boudiaf',            'Qatar', 'B', 'normal', 1, 18),
    (v_album_id, 'QAT11', 11, 'Assim Madibo',             'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT12', 12, 'Ahmed Fatehi',             'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT13', 13, 'Team Photo (Plantel)',     'Qatar', 'B', 'special', 2, 19),
    (v_album_id, 'QAT14', 14, 'Mohammed Waad',            'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT15', 15, 'Abdulaziz Hatem',          'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT16', 16, 'Hassan Al-Haydos',         'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT17', 17, 'Edmilson Junior',          'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT18', 18, 'Akram Hassan Afif',        'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT19', 19, 'Ahmed Al Ganehi',          'Qatar', 'B', 'normal', 1, 19),
    (v_album_id, 'QAT20', 20, 'Almoez Ali',               'Qatar', 'B', 'normal', 1, 19),

    -- Bosnia y Herzegovina (20-21)
    (v_album_id, 'BIH1',  1,  'Escudo de Bosnia y Herzegovina', 'Bosnia y Herzegovina', 'B', 'shiny',  2, 20),
    (v_album_id, 'BIH2',  2,  'Nikola Vasilj',            'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH3',  3,  'Amer Dedić',               'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH4',  4,  'Sead Kolašinac',           'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH5',  5,  'Tarik Muharemović',        'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH6',  6,  'Nihad Mujakić',            'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH7',  7,  'Nikola Katić',             'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH8',  8,  'Amir Hadžiahmetović',      'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH9',  9,  'Benjamin Tahirović',       'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH10', 10, 'Armin Gigović',            'Bosnia y Herzegovina', 'B', 'normal', 1, 20),
    (v_album_id, 'BIH11', 11, 'Ivan Šunjić',              'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH12', 12, 'Ivan Bašić',               'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH13', 13, 'Team Photo (Plantel)',     'Bosnia y Herzegovina', 'B', 'special', 2, 21),
    (v_album_id, 'BIH14', 14, 'Dženis Burnić',            'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH15', 15, 'Esmir Bajraktarević',      'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH16', 16, 'Amar Memić',               'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH17', 17, 'Ermedin Demirović',        'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH18', 18, 'Edin Džeko',               'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH19', 19, 'Samed Baždar',             'Bosnia y Herzegovina', 'B', 'normal', 1, 21),
    (v_album_id, 'BIH20', 20, 'Haris Tabaković',          'Bosnia y Herzegovina', 'B', 'normal', 1, 21),

    -- Suiza (22-23)
    (v_album_id, 'SUI1',  1,  'Escudo de Suiza',          'Suiza', 'B', 'shiny',  2, 22),
    (v_album_id, 'SUI2',  2,  'Gregor Kobel',             'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI3',  3,  'Yvon Mvogo',               'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI4',  4,  'Manuel Akanji',            'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI5',  5,  'Ricardo Rodriguez',        'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI6',  6,  'Nico Elvedi',              'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI7',  7,  'Aurèle Amenda',            'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI8',  8,  'Silvan Widmer',            'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI9',  9,  'Granit Xhaka',             'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI10', 10, 'Denis Zakaria',            'Suiza', 'B', 'normal', 1, 22),
    (v_album_id, 'SUI11', 11, 'Remo Freuler',             'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI12', 12, 'Fabian Rieder',            'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI13', 13, 'Team Photo (Plantel)',     'Suiza', 'B', 'special', 2, 23),
    (v_album_id, 'SUI14', 14, 'Ardon Jashari',            'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI15', 15, 'Johan Manzambi',           'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI16', 16, 'Michel Aebischer',         'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI17', 17, 'Breel Embolo',             'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI18', 18, 'Ruben Vargas',             'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI19', 19, 'Dan Ndoye',                'Suiza', 'B', 'normal', 1, 23),
    (v_album_id, 'SUI20', 20, 'Zeki Amdouni',             'Suiza', 'B', 'normal', 1, 23);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
