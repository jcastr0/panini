-- Seed real del Grupo D: Estados Unidos, Paraguay, Australia, Turquía.
-- Páginas 32-39. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';

  delete from public.stickers where album_id = v_album_id and group_code = 'D';

  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Estados Unidos (32-33)
    (v_album_id, 'USA1',  1,  'Escudo de Estados Unidos', 'Estados Unidos', 'D', 'shiny',  2, 32),
    (v_album_id, 'USA2',  2,  'Matt Freese',              'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA3',  3,  'Chris Richards',           'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA4',  4,  'Tim Ream',                 'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA5',  5,  'Mark McKenzie',            'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA6',  6,  'Alex Freeman',             'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA7',  7,  'Antonee Robinson',         'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA8',  8,  'Tyler Adams',              'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA9',  9,  'Tanner Tessmann',          'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA10', 10, 'Weston McKenny',           'Estados Unidos', 'D', 'normal', 1, 32),
    (v_album_id, 'USA11', 11, 'Christian Roldan',         'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA12', 12, 'Timothy Weah',             'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA13', 13, 'Team Photo (Plantel)',     'Estados Unidos', 'D', 'special', 2, 33),
    (v_album_id, 'USA14', 14, 'Diego Luna',               'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA15', 15, 'Malik Tillman',            'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA16', 16, 'Christian Pulisic',        'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA17', 17, 'Brenden Aaronson',         'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA18', 18, 'Ricardo Pepi',             'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA19', 19, 'Haji Wright',              'Estados Unidos', 'D', 'normal', 1, 33),
    (v_album_id, 'USA20', 20, 'Folarin Balogun',          'Estados Unidos', 'D', 'normal', 1, 33),

    -- Paraguay (34-35)
    (v_album_id, 'PAR1',  1,  'Escudo de Paraguay',       'Paraguay', 'D', 'shiny',  2, 34),
    (v_album_id, 'PAR2',  2,  'Roberto Fernandez',        'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR3',  3,  'Orlando Gill',             'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR4',  4,  'Gustavo Gomez',            'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR5',  5,  'Fabián Balbuena',          'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR6',  6,  'Juan José Cáceres',        'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR7',  7,  'Omar Alderete',            'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR8',  8,  'Junior Alonso',            'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR9',  9,  'Mathías Villasanti',       'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR10', 10, 'Diego Gomez',              'Paraguay', 'D', 'normal', 1, 34),
    (v_album_id, 'PAR11', 11, 'Damián Bobadilla',         'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR12', 12, 'Andres Cubas',             'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR13', 13, 'Team Photo (Plantel)',     'Paraguay', 'D', 'special', 2, 35),
    (v_album_id, 'PAR14', 14, 'Matias Galarza Fonda',     'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR15', 15, 'Julio Enciso',             'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR16', 16, 'Alejandro Romero Gamarra', 'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR17', 17, 'Miguel Almirón',           'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR18', 18, 'Ramon Sosa',               'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR19', 19, 'Angel Romero',             'Paraguay', 'D', 'normal', 1, 35),
    (v_album_id, 'PAR20', 20, 'Antonio Sanabria',         'Paraguay', 'D', 'normal', 1, 35),

    -- Australia (36-37)
    (v_album_id, 'AUS1',  1,  'Escudo de Australia',      'Australia', 'D', 'shiny',  2, 36),
    (v_album_id, 'AUS2',  2,  'Mathew Ryan',              'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS3',  3,  'Joe Gauci',                'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS4',  4,  'Harry Souttar',            'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS5',  5,  'Alessandro Circati',       'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS6',  6,  'Jordan Bos',               'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS7',  7,  'Aziz Behich',              'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS8',  8,  'Cameron Burgess',          'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS9',  9,  'Lewis Miller',             'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS10', 10, 'Milos Degenek',            'Australia', 'D', 'normal', 1, 36),
    (v_album_id, 'AUS11', 11, 'Jackson Irvine',           'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS12', 12, 'Riley McGree',             'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS13', 13, 'Team Photo (Plantel)',     'Australia', 'D', 'special', 2, 37),
    (v_album_id, 'AUS14', 14, 'Aiden O''Neill',           'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS15', 15, 'Connor Metcalfe',          'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS16', 16, 'Patrick Yazbek',           'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS17', 17, 'Craig Goodwin',            'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS18', 18, 'Kusini Yengi',             'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS19', 19, 'Nestory Irankunda',        'Australia', 'D', 'normal', 1, 37),
    (v_album_id, 'AUS20', 20, 'Mohamed Touré',            'Australia', 'D', 'normal', 1, 37),

    -- Turquía (38-39)
    (v_album_id, 'TUR1',  1,  'Escudo de Turquía',        'Turquía', 'D', 'shiny',  2, 38),
    (v_album_id, 'TUR2',  2,  'Ugurcan Cakir',            'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR3',  3,  'Mert Muldur',              'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR4',  4,  'Zeki Celik',               'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR5',  5,  'Abdulkerim Bardakci',      'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR6',  6,  'Caglar Soyuncu',           'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR7',  7,  'Merih Demiral',            'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR8',  8,  'Ferdi Kadioglu',           'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR9',  9,  'Kaan Ayhan',               'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR10', 10, 'Ismail Yuksek',            'Turquía', 'D', 'normal', 1, 38),
    (v_album_id, 'TUR11', 11, 'Hakan Calhanoglu',         'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR12', 12, 'Orkun Kokcu',              'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR13', 13, 'Team Photo (Plantel)',     'Turquía', 'D', 'special', 2, 39),
    (v_album_id, 'TUR14', 14, 'Arda Guler',               'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR15', 15, 'Irfan Can Kahveci',        'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR16', 16, 'Yunus Akgun',              'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR17', 17, 'Can Uzun',                 'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR18', 18, 'Baris Alper Yilmaz',       'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR19', 19, 'Kerem Akturkoglu',         'Turquía', 'D', 'normal', 1, 39),
    (v_album_id, 'TUR20', 20, 'Kenan Yildiz',             'Turquía', 'D', 'normal', 1, 39);

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;
end $$;
