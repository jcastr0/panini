-- Seed real del Grupo C: Brasil, Marruecos, Haití, Escocia.
-- Páginas 24-31 (2 páginas por equipo, 10 cromos por página).

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Brasil (24-25)
    (v_album_id, 'BRA1',  1,  'Escudo de Brasil',         'Brasil', 'C', 'shiny',  2, 24),
    (v_album_id, 'BRA2',  2,  'Alisson',                  'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA3',  3,  'Bento',                    'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA4',  4,  'Marquinhos',               'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA5',  5,  'Éder Militão',             'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA6',  6,  'Gabriel Magalhães',        'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA7',  7,  'Danilo',                   'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA8',  8,  'Wesley',                   'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA9',  9,  'Lucas Paquetá',            'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA10', 10, 'Casemiro',                 'Brasil', 'C', 'normal', 1, 24),
    (v_album_id, 'BRA11', 11, 'Bruno Guimarães',          'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA12', 12, 'Luiz Henrique',            'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA13', 13, 'Team Photo (Plantel)',     'Brasil', 'C', 'special', 2, 25),
    (v_album_id, 'BRA14', 14, 'Vinicius Júnior',          'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA15', 15, 'Rodrygo',                  'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA16', 16, 'João Pedro',               'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA17', 17, 'Matheus Cunha',            'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA18', 18, 'Gabriel Martinelli',       'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA19', 19, 'Raphinha',                 'Brasil', 'C', 'normal', 1, 25),
    (v_album_id, 'BRA20', 20, 'Estévão',                  'Brasil', 'C', 'normal', 1, 25),

    -- Marruecos (26-27)
    (v_album_id, 'MAR1',  1,  'Escudo de Marruecos',      'Marruecos', 'C', 'shiny',  2, 26),
    (v_album_id, 'MAR2',  2,  'Yassine Bounou',           'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR3',  3,  'Munir El Kajoui',          'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR4',  4,  'Achraf Hakimi',            'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR5',  5,  'Noussair Mazraoui',        'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR6',  6,  'Nayef Aguerd',             'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR7',  7,  'Romain Saïss',             'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR8',  8,  'Jawad El Yamiq',           'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR9',  9,  'Adam Masina',              'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR10', 10, 'Sofyan Amrabat',           'Marruecos', 'C', 'normal', 1, 26),
    (v_album_id, 'MAR11', 11, 'Azzedine Ounahi',          'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR12', 12, 'Eliesse Ben Seghir',       'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR13', 13, 'Team Photo (Plantel)',     'Marruecos', 'C', 'special', 2, 27),
    (v_album_id, 'MAR14', 14, 'Bilal El Khannouss',       'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR15', 15, 'Ismael Saibari',           'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR16', 16, 'Youssef En-Nesyri',        'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR17', 17, 'Abde Ezzalzouli',          'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR18', 18, 'Soufiane Rahimi',          'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR19', 19, 'Brahim Diaz',              'Marruecos', 'C', 'normal', 1, 27),
    (v_album_id, 'MAR20', 20, 'Ayoub El Kaabi',           'Marruecos', 'C', 'normal', 1, 27),

    -- Haití (28-29)
    (v_album_id, 'HAI1',  1,  'Escudo de Haití',          'Haití', 'C', 'shiny',  2, 28),
    (v_album_id, 'HAI2',  2,  'Johny Placide',            'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI3',  3,  'Carlens Arcus',            'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI4',  4,  'Martin Expérience',        'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI5',  5,  'Jean-Kevin Duverne',       'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI6',  6,  'Ricardo Adé',              'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI7',  7,  'Duke Lacroix',             'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI8',  8,  'Garven Metusala',          'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI9',  9,  'Hannes Delcroix',          'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI10', 10, 'Leverton Pierre',          'Haití', 'C', 'normal', 1, 28),
    (v_album_id, 'HAI11', 11, 'Danley Jean Jacques',      'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI12', 12, 'Jean-Ricner Bellegarde',   'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI13', 13, 'Team Photo (Plantel)',     'Haití', 'C', 'special', 2, 29),
    (v_album_id, 'HAI14', 14, 'Christopher Attys',        'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI15', 15, 'Derrick Etienne Jr',       'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI16', 16, 'Josue Casimir',            'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI17', 17, 'Ruben Providence',         'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI18', 18, 'Duckens Nazon',            'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI19', 19, 'Louicius Deedson',         'Haití', 'C', 'normal', 1, 29),
    (v_album_id, 'HAI20', 20, 'Frantzdy Pierrot',         'Haití', 'C', 'normal', 1, 29),

    -- Escocia (30-31)
    (v_album_id, 'SCO1',  1,  'Escudo de Escocia',        'Escocia', 'C', 'shiny',  2, 30),
    (v_album_id, 'SCO2',  2,  'Angus Gunn',               'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO3',  3,  'Jack Hendry',              'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO4',  4,  'Kieran Tierney',           'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO5',  5,  'Aaron Hickey',             'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO6',  6,  'Andrew Robertson',         'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO7',  7,  'Scott McKenna',            'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO8',  8,  'John Souttar',             'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO9',  9,  'Anthony Ralston',          'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO10', 10, 'Grant Hanley',             'Escocia', 'C', 'normal', 1, 30),
    (v_album_id, 'SCO11', 11, 'Scott McTominay',          'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO12', 12, 'Billy Gilmour',            'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO13', 13, 'Team Photo (Plantel)',     'Escocia', 'C', 'special', 2, 31),
    (v_album_id, 'SCO14', 14, 'Lewis Ferguson',           'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO15', 15, 'Ryan Christie',            'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO16', 16, 'Kenny McLean',             'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO17', 17, 'John McGinn',              'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO18', 18, 'Lyndon Dykes',             'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO19', 19, 'Che Adams',                'Escocia', 'C', 'normal', 1, 31),
    (v_album_id, 'SCO20', 20, 'Ben Gannon-Doak',          'Escocia', 'C', 'normal', 1, 31)
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
