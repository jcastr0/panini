-- Seed the 27 Legends for FWC2026 (p100-p101 of the album).
-- UPSERT by (album_id, code) — preserves UUIDs and any FK references.
-- Zero DELETE. See feedback-no-data-loss memory.
--
-- All 27 legends are vertical 3:4 player cards (385×511). The number
-- column is just visual display order; no horizontal/vertical split.

do $$
declare
  v_album_id  uuid;
  v_tur14     uuid; v_sen15     uuid; v_usa16     uuid; v_uru10     uuid;
  v_cro9      uuid; v_col20     uuid; v_bel2      uuid; v_arg17     uuid;
  v_egy17     uuid; v_por15     uuid; v_aus2      uuid; v_nor15     uuid;
  v_ned3      uuid; v_ger15     uuid; v_mar19     uuid; v_esp15     uuid;
  v_cuw12     uuid; v_jpn12     uuid; v_alg15     uuid; v_ecu9      uuid;
  v_swe20     uuid; v_fra20     uuid; v_par10     uuid; v_eng12     uuid;
  v_kor18     uuid;
begin
  select id into v_album_id from public.albums where code = 'FWC2026';
  if v_album_id is null then
    raise exception 'Album FWC2026 not found';
  end if;

  -- Lookup the linked slot UUIDs (validated via test/legends-final-lookup.ts)
  select id into v_tur14 from public.stickers where album_id = v_album_id and code = 'TUR14';
  select id into v_sen15 from public.stickers where album_id = v_album_id and code = 'SEN15';
  select id into v_usa16 from public.stickers where album_id = v_album_id and code = 'USA16';
  select id into v_uru10 from public.stickers where album_id = v_album_id and code = 'URU10';
  select id into v_cro9  from public.stickers where album_id = v_album_id and code = 'CRO9';
  select id into v_col20 from public.stickers where album_id = v_album_id and code = 'COL20';
  select id into v_bel2  from public.stickers where album_id = v_album_id and code = 'BEL2';
  select id into v_arg17 from public.stickers where album_id = v_album_id and code = 'ARG17';
  select id into v_egy17 from public.stickers where album_id = v_album_id and code = 'EGY17';
  select id into v_por15 from public.stickers where album_id = v_album_id and code = 'POR15';
  select id into v_aus2  from public.stickers where album_id = v_album_id and code = 'AUS2';
  select id into v_nor15 from public.stickers where album_id = v_album_id and code = 'NOR15';
  select id into v_ned3  from public.stickers where album_id = v_album_id and code = 'NED3';
  select id into v_ger15 from public.stickers where album_id = v_album_id and code = 'GER15';
  select id into v_mar19 from public.stickers where album_id = v_album_id and code = 'MAR19';
  select id into v_esp15 from public.stickers where album_id = v_album_id and code = 'ESP15';
  select id into v_cuw12 from public.stickers where album_id = v_album_id and code = 'CUW12';
  select id into v_jpn12 from public.stickers where album_id = v_album_id and code = 'JPN12';
  select id into v_alg15 from public.stickers where album_id = v_album_id and code = 'ALG15';
  select id into v_ecu9  from public.stickers where album_id = v_album_id and code = 'ECU9';
  select id into v_swe20 from public.stickers where album_id = v_album_id and code = 'SWE20';
  select id into v_fra20 from public.stickers where album_id = v_album_id and code = 'FRA20';
  select id into v_par10 from public.stickers where album_id = v_album_id and code = 'PAR10';
  select id into v_eng12 from public.stickers where album_id = v_album_id and code = 'ENG12';
  select id into v_kor18 from public.stickers where album_id = v_album_id and code = 'KOR18';

  -- Defensive: validate that all 25 expected player slots were found.
  -- If any is NULL, the corresponding legend would be inserted unlinked
  -- (silent breakage). Fail loud instead. Stand-alones (LEGBRA0, LEGMEX0)
  -- don't need lookup — their linked_sticker_id is intentionally NULL.
  if v_tur14 is null then raise exception 'Slot TUR14 not found in stickers'; end if;
  if v_sen15 is null then raise exception 'Slot SEN15 not found in stickers'; end if;
  if v_usa16 is null then raise exception 'Slot USA16 not found in stickers'; end if;
  if v_uru10 is null then raise exception 'Slot URU10 not found in stickers'; end if;
  if v_cro9  is null then raise exception 'Slot CRO9 not found in stickers';  end if;
  if v_col20 is null then raise exception 'Slot COL20 not found in stickers'; end if;
  if v_bel2  is null then raise exception 'Slot BEL2 not found in stickers';  end if;
  if v_arg17 is null then raise exception 'Slot ARG17 not found in stickers'; end if;
  if v_egy17 is null then raise exception 'Slot EGY17 not found in stickers'; end if;
  if v_por15 is null then raise exception 'Slot POR15 not found in stickers'; end if;
  if v_aus2  is null then raise exception 'Slot AUS2 not found in stickers';  end if;
  if v_nor15 is null then raise exception 'Slot NOR15 not found in stickers'; end if;
  if v_ned3  is null then raise exception 'Slot NED3 not found in stickers';  end if;
  if v_ger15 is null then raise exception 'Slot GER15 not found in stickers'; end if;
  if v_mar19 is null then raise exception 'Slot MAR19 not found in stickers'; end if;
  if v_esp15 is null then raise exception 'Slot ESP15 not found in stickers'; end if;
  if v_cuw12 is null then raise exception 'Slot CUW12 not found in stickers'; end if;
  if v_jpn12 is null then raise exception 'Slot JPN12 not found in stickers'; end if;
  if v_alg15 is null then raise exception 'Slot ALG15 not found in stickers'; end if;
  if v_ecu9  is null then raise exception 'Slot ECU9 not found in stickers';  end if;
  if v_swe20 is null then raise exception 'Slot SWE20 not found in stickers'; end if;
  if v_fra20 is null then raise exception 'Slot FRA20 not found in stickers'; end if;
  if v_par10 is null then raise exception 'Slot PAR10 not found in stickers'; end if;
  if v_eng12 is null then raise exception 'Slot ENG12 not found in stickers'; end if;
  if v_kor18 is null then raise exception 'Slot KOR18 not found in stickers'; end if;

  -- 27 legends. numbers 1..14 are page 100; numbers 15..27 are page 101.
  -- All vertical 3:4 player cards.
  insert into public.stickers
    (album_id, code, number, name, team, group_code, type, rarity, page, linked_sticker_id)
  values
    -- Page 100 (14 cards)
    (v_album_id, 'LEGTUR14', 1,  'Arda Güler',         'Turquía',        null, 'legend', 5, 100, v_tur14),
    (v_album_id, 'LEGSEN15', 2,  'Sadio Mané',         'Senegal',        null, 'legend', 5, 100, v_sen15),
    (v_album_id, 'LEGUSA16', 3,  'Christian Pulisic',  'Estados Unidos', null, 'legend', 5, 100, v_usa16),
    (v_album_id, 'LEGURU10', 4,  'Federico Valverde',  'Uruguay',        null, 'legend', 5, 100, v_uru10),
    (v_album_id, 'LEGCRO9',  5,  'Luka Modrić',        'Croacia',        null, 'legend', 5, 100, v_cro9),
    (v_album_id, 'LEGCOL20', 6,  'Luis Díaz',          'Colombia',       null, 'legend', 5, 100, v_col20),
    (v_album_id, 'LEGBEL2',  7,  'Thibaut Courtois',   'Bélgica',        null, 'legend', 5, 100, v_bel2),
    (v_album_id, 'LEGARG17', 8,  'Lionel Messi',       'Argentina',      null, 'legend', 5, 100, v_arg17),
    (v_album_id, 'LEGEGY17', 9,  'Mohamed Salah',      'Egipto',         null, 'legend', 5, 100, v_egy17),
    (v_album_id, 'LEGPOR15', 10, 'Cristiano Ronaldo',  'Portugal',       null, 'legend', 5, 100, v_por15),
    (v_album_id, 'LEGAUS2',  11, 'Mathew Ryan',        'Australia',      null, 'legend', 5, 100, v_aus2),
    (v_album_id, 'LEGBRA0',  12, 'Neymar Jr',          'Brasil',         null, 'legend', 5, 100, null),
    (v_album_id, 'LEGNOR15', 13, 'Erling Haaland',     'Noruega',        null, 'legend', 5, 100, v_nor15),
    (v_album_id, 'LEGNED3',  14, 'Virgil van Dijk',    'Países Bajos',   null, 'legend', 5, 100, v_ned3),
    -- Page 101 (13 cards)
    (v_album_id, 'LEGGER15', 15, 'Jamal Musiala',      'Alemania',       null, 'legend', 5, 101, v_ger15),
    (v_album_id, 'LEGMAR19', 16, 'Brahim Díaz',        'Marruecos',      null, 'legend', 5, 101, v_mar19),
    (v_album_id, 'LEGESP15', 17, 'Lamine Yamal',       'España',         null, 'legend', 5, 101, v_esp15),
    (v_album_id, 'LEGCUW12', 18, 'Leandro Bacuna',     'Curazao',        null, 'legend', 5, 101, v_cuw12),
    (v_album_id, 'LEGJPN12', 19, 'Takefusa Kubo',      'Japón',          null, 'legend', 5, 101, v_jpn12),
    (v_album_id, 'LEGALG15', 20, 'Riyad Mahrez',       'Argelia',        null, 'legend', 5, 101, v_alg15),
    (v_album_id, 'LEGECU9',  21, 'Moisés Caicedo',     'Ecuador',        null, 'legend', 5, 101, v_ecu9),
    (v_album_id, 'LEGSWE20', 22, 'Viktor Gyökeres',    'Suecia',         null, 'legend', 5, 101, v_swe20),
    (v_album_id, 'LEGFRA20', 23, 'Kylian Mbappé',      'Francia',        null, 'legend', 5, 101, v_fra20),
    (v_album_id, 'LEGPAR10', 24, 'Diego Gómez',        'Paraguay',       null, 'legend', 5, 101, v_par10),
    (v_album_id, 'LEGENG12', 25, 'Cole Palmer',        'Inglaterra',     null, 'legend', 5, 101, v_eng12),
    (v_album_id, 'LEGMEX0',  26, 'Gilberto Mora',      'México',         null, 'legend', 5, 101, null),
    (v_album_id, 'LEGKOR18', 27, 'Son Heung-min',      'Corea del Sur',  null, 'legend', 5, 101, v_kor18)
  on conflict (album_id, code) where code is not null
  do update set
    number             = excluded.number,
    name               = excluded.name,
    team               = excluded.team,
    group_code         = excluded.group_code,
    type               = excluded.type,
    rarity             = excluded.rarity,
    page               = excluded.page,
    linked_sticker_id  = excluded.linked_sticker_id;

  update public.albums a
     set total_stickers = (select count(*) from public.stickers where album_id = a.id)
   where a.id = v_album_id;

  raise notice 'Seeded 27 legends. Total stickers in album now: %',
    (select total_stickers from public.albums where id = v_album_id);
end $$;
