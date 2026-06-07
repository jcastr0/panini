-- Reordena find_trade_matches: prioriza a quien ME ofrece más, no el total.
-- El "score" se mantiene en la salida (total potencial) por compatibilidad
-- con la UI; solo cambia el ORDER BY.

create or replace function public.find_trade_matches(p_user_id uuid)
returns table (
  other_user uuid,
  username text,
  display_name text,
  city text,
  they_offer_count int,
  i_offer_count int,
  score int
)
language sql
stable
security definer
set search_path = public
as $$
  with
  my_dupes as (
    select sticker_id, quantity - 1 as available
    from public.user_stickers
    where user_id = p_user_id and quantity > 1
  ),
  my_missing as (
    select s.id as sticker_id
    from public.stickers s
    join public.albums a on a.id = s.album_id and a.is_active = true
    where not exists (
      select 1 from public.user_stickers us
      where us.user_id = p_user_id
        and us.sticker_id = s.id
        and us.quantity >= 1
    )
  ),
  they_can_offer as (
    select us.user_id as other_user, count(*)::int as they_offer_count
    from public.user_stickers us
    join my_missing mm on mm.sticker_id = us.sticker_id
    where us.user_id <> p_user_id and us.quantity > 1
    group by us.user_id
  ),
  i_can_offer as (
    select p.id as other_user, count(*)::int as i_offer_count
    from public.profiles p
    cross join my_dupes md
    where p.id <> p_user_id
      and p.is_public_profile = true
      and not exists (
        select 1 from public.user_stickers us
        where us.user_id = p.id
          and us.sticker_id = md.sticker_id
          and us.quantity >= 1
      )
    group by p.id
  )
  select
    p.id as other_user,
    p.username,
    p.display_name,
    p.city,
    coalesce(t.they_offer_count, 0) as they_offer_count,
    coalesce(i.i_offer_count, 0)    as i_offer_count,
    coalesce(t.they_offer_count, 0) + coalesce(i.i_offer_count, 0) as score
  from public.profiles p
  left join they_can_offer t on t.other_user = p.id
  left join i_can_offer    i on i.other_user = p.id
  where p.id <> p_user_id
    and p.is_public_profile = true
    and (coalesce(t.they_offer_count, 0) > 0 or coalesce(i.i_offer_count, 0) > 0)
  -- Primario: cuánto ME ofrecen (lo que más le interesa al usuario que busca).
  -- Desempate: cuánto yo le puedo dar.
  -- Última garantía de orden estable: username.
  order by
    coalesce(t.they_offer_count, 0) desc,
    coalesce(i.i_offer_count, 0)    desc,
    p.username asc
  limit 100;
$$;

grant execute on function public.find_trade_matches(uuid) to authenticated;
