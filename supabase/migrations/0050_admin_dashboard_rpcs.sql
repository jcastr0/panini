-- RPCs que sirven series temporales para el dashboard admin.

create or replace function public.get_admin_signups_per_day(p_days int default 30)
returns table(day date, n bigint)
language sql
stable
security definer
set search_path = public
as $$
  with days as (
    select generate_series(
      (current_date - (p_days - 1))::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select d.day,
         coalesce(count(p.id), 0) as n
    from days d
    left join public.profiles p
      on p.created_at::date = d.day
   group by d.day
   order by d.day asc;
$$;

grant execute on function public.get_admin_signups_per_day(int) to authenticated;
