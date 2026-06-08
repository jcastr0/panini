-- Fix: admin_update_album_meta usaba la columna `year` que no existe.
-- La columna correcta es `edition_year`. Mantengo el parámetro p_year en
-- la signature de la RPC (UI no cambia) pero internamente mapea a edition_year.

create or replace function public.admin_update_album_meta(
  p_album_id uuid,
  p_name text,
  p_year int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_prev record;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  select name, edition_year as year into v_prev from public.albums where id = p_album_id;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;

  update public.albums
     set name = coalesce(p_name, name),
         edition_year = coalesce(p_year, edition_year)
   where id = p_album_id;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'update_album_meta', 'album', p_album_id,
               jsonb_build_object(
                 'prev_name', v_prev.name,
                 'prev_year', v_prev.year,
                 'new_name', p_name,
                 'new_year', p_year
               ));
end;
$$;

grant execute on function public.admin_update_album_meta(uuid, text, int) to authenticated;
