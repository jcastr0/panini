-- Devuelve el email de auth.users para una lista de IDs.
-- Solo accesible para admins (valida internamente).
create or replace function public.get_admin_user_emails(p_ids uuid[])
returns table(id uuid, email text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'NOT_ADMIN';
  end if;
  return query
    select u.id, u.email::text
      from auth.users u
     where u.id = any(p_ids);
end;
$$;

grant execute on function public.get_admin_user_emails(uuid[]) to authenticated;
