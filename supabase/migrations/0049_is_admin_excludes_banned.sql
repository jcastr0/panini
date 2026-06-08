-- Cierra hueco: un admin baneado seguía siendo admin para el helper is_admin().
-- Ahora un admin con banned_at != null pierde sus privilegios automáticamente.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin
       from public.profiles
      where id = uid
        and deleted_at is null
        and banned_at is null),
    false
  );
$$;
