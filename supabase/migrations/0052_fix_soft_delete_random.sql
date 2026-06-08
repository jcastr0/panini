-- Fix: admin_soft_delete_user usaba gen_random_bytes que requiere pgcrypto.
-- Reemplazo por md5(random()::text || clock_timestamp()::text) que solo
-- usa funciones built-in. La aleatoriedad no necesita ser criptográfica
-- — es solo para evitar colisiones en el sufijo del username liberado.

create or replace function public.admin_soft_delete_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_username_original text;
  v_deleted_username text;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  if p_target = v_uid then
    raise exception 'NO_SELF_ACTION';
  end if;

  select username into v_username_original from public.profiles where id = p_target;
  if v_username_original is null then
    raise exception 'INVALID_TARGET';
  end if;
  if v_username_original like '__deleted_%' then
    raise exception 'ALREADY_IN_STATE: usuario ya estaba borrado';
  end if;

  v_deleted_username := '__deleted_' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);

  update public.profiles
     set deleted_at = now(),
         is_public_profile = false,
         username = v_deleted_username
   where id = p_target;

  -- Cancelar trades pending/accepted
  with cancelled as (
    update public.trades
       set status = 'cancelled', updated_at = now()
     where status in ('pending','accepted')
       and (from_user = p_target or to_user = p_target)
    returning id, from_user, to_user
  ),
  others as (
    select id, case when from_user = p_target then to_user else from_user end as other_id
      from cancelled
  )
  insert into public.notifications(user_id, kind, trade_id, meta)
  select other_id, 'trade_cancelled_admin', id, jsonb_build_object('reason', 'usuario eliminado')
    from others;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'soft_delete_user', 'user', p_target,
               jsonb_build_object('username_original', v_username_original));
end;
$$;

grant execute on function public.admin_soft_delete_user(uuid) to authenticated;
