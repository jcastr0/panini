-- Para cada equipo: 10 cromos por página.
--   Números 1-10  → página inferior (la primera de las dos del equipo)
--   Números 11-20 → página superior (la segunda)
-- Originalmente el #10 había quedado en la segunda página (9 + 11 cromos), lo movemos.

do $$
declare
  r record;
begin
  for r in
    select album_id, team, min(page) as p1, max(page) as p2
      from public.stickers
     where group_code is not null
       and team is not null
       and page is not null
     group by album_id, team
    having count(distinct page) = 2
  loop
    update public.stickers
       set page = r.p1
     where album_id = r.album_id and team = r.team and number between 1 and 10;
    update public.stickers
       set page = r.p2
     where album_id = r.album_id and team = r.team and number between 11 and 20;
  end loop;
end $$;
