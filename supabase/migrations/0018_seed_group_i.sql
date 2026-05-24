-- Seed real del Grupo I: Francia, Senegal, Irak, Noruega.
-- Páginas 72-79. 1-10 en la primera página de cada equipo, 11-20 en la segunda.

do $$
declare
  v_album_id uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  -- DELETE removido: seeds usan UPSERT (ver 0028_data_safety.sql)
  insert into public.stickers (album_id, code, number, name, team, group_code, type, rarity, page) values
    -- Francia (72-73)
    (v_album_id, 'FRA1',  1,  'Escudo de Francia',        'Francia', 'I', 'shiny',  2, 72),
    (v_album_id, 'FRA2',  2,  'Mike Maignan',             'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA3',  3,  'Theo Hernandez',           'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA4',  4,  'William Saliba',           'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA5',  5,  'Jules Kounde',             'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA6',  6,  'Ibrahima Konate',          'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA7',  7,  'Dayot Upamecano',          'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA8',  8,  'Lucas Digne',              'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA9',  9,  'Aurélien Tchouaméni',      'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA10', 10, 'Eduardo Camavinga',        'Francia', 'I', 'normal', 1, 72),
    (v_album_id, 'FRA11', 11, 'Manu Kone',                'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA12', 12, 'Adrien Rabiot',            'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA13', 13, 'Team Photo (Plantel)',     'Francia', 'I', 'special', 2, 73),
    (v_album_id, 'FRA14', 14, 'Michael Olise',            'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA15', 15, 'Ousmane Dembele',          'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA16', 16, 'Bradley Barcola',          'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA17', 17, 'Désiré Doué',              'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA18', 18, 'Kingsley Coman',           'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA19', 19, 'Hugo Ekitike',             'Francia', 'I', 'normal', 1, 73),
    (v_album_id, 'FRA20', 20, 'Kylian Mbappe',            'Francia', 'I', 'normal', 1, 73),

    -- Senegal (74-75)
    (v_album_id, 'SEN1',  1,  'Escudo de Senegal',        'Senegal', 'I', 'shiny',  2, 74),
    (v_album_id, 'SEN2',  2,  'Édouard Mendy',            'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN3',  3,  'Yehvann Diouf',            'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN4',  4,  'Moussa Niakhaté',          'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN5',  5,  'Abdoulaye Seck',           'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN6',  6,  'Ismail Jakobs',            'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN7',  7,  'El Hadji Malick Diouf',    'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN8',  8,  'Kalidou Koulibaly',        'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN9',  9,  'Idrissa Gana Gueye',       'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN10', 10, 'Pape Matar Sarr',          'Senegal', 'I', 'normal', 1, 74),
    (v_album_id, 'SEN11', 11, 'Pape Gueye',               'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN12', 12, 'Habib Diarra',             'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN13', 13, 'Team Photo (Plantel)',     'Senegal', 'I', 'special', 2, 75),
    (v_album_id, 'SEN14', 14, 'Lamine Camara',            'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN15', 15, 'Sadio Mane',               'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN16', 16, 'Ismaïla Sarr',             'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN17', 17, 'Boulaye Dia',              'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN18', 18, 'Iliman Ndiaye',            'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN19', 19, 'Nicolas Jackson',          'Senegal', 'I', 'normal', 1, 75),
    (v_album_id, 'SEN20', 20, 'Krepin Diatta',            'Senegal', 'I', 'normal', 1, 75),

    -- Irak (76-77)
    (v_album_id, 'IRQ1',  1,  'Escudo de Irak',           'Irak', 'I', 'shiny',  2, 76),
    (v_album_id, 'IRQ2',  2,  'Jalal Hassan',             'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ3',  3,  'Rebin Sulaka',             'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ4',  4,  'Hussein Ali',              'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ5',  5,  'Akam Hashem',              'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ6',  6,  'Merchas Doski',            'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ7',  7,  'Zaid Tahseen',             'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ8',  8,  'Manaf Younis',             'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ9',  9,  'Zidane Iqbal',             'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ10', 10, 'Amir Al-Ammari',           'Irak', 'I', 'normal', 1, 76),
    (v_album_id, 'IRQ11', 11, 'Ibrahim Bayesh',           'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ12', 12, 'Ali Jasim',                'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ13', 13, 'Team Photo (Plantel)',     'Irak', 'I', 'special', 2, 77),
    (v_album_id, 'IRQ14', 14, 'Youssef Amyn',             'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ15', 15, 'Aimar Sher',               'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ16', 16, 'Marko Farji',              'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ17', 17, 'Osama Rashid',             'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ18', 18, 'Ali Al-Hamadi',            'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ19', 19, 'Aymen Hussein',            'Irak', 'I', 'normal', 1, 77),
    (v_album_id, 'IRQ20', 20, 'Mohanad Ali',              'Irak', 'I', 'normal', 1, 77),

    -- Noruega (78-79)
    (v_album_id, 'NOR1',  1,  'Escudo de Noruega',        'Noruega', 'I', 'shiny',  2, 78),
    (v_album_id, 'NOR2',  2,  'Orjan Nyland',             'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR3',  3,  'Julian Ryerson',           'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR4',  4,  'Leo Ostigård',             'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR5',  5,  'Kristoffer Vassbakk Ajer', 'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR6',  6,  'Marcus Holmgren Pedersen', 'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR7',  7,  'David Møller Wolfe',       'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR8',  8,  'Torbjørn Heggem',          'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR9',  9,  'Morten Thorsby',           'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR10', 10, 'Martin Ødegaard',          'Noruega', 'I', 'normal', 1, 78),
    (v_album_id, 'NOR11', 11, 'Sander Berge',             'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR12', 12, 'Andreas Schjelderup',      'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR13', 13, 'Team Photo (Plantel)',     'Noruega', 'I', 'special', 2, 79),
    (v_album_id, 'NOR14', 14, 'Patrick Berg',             'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR15', 15, 'Erling Haaland',           'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR16', 16, 'Alexander Sørloth',        'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR17', 17, 'Aron Dønnum',              'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR18', 18, 'Jorgen Strand Larsen',     'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR19', 19, 'Antonio Nusa',             'Noruega', 'I', 'normal', 1, 79),
    (v_album_id, 'NOR20', 20, 'Oscar Bobb',               'Noruega', 'I', 'normal', 1, 79)
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
