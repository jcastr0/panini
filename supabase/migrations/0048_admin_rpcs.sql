-- RPCs admin. Todas validan is_admin(auth.uid()), insertan en admin_actions.
--
-- - admin_set_user_banned(uid, banned, reason)
-- - admin_soft_delete_user(uid)
-- - admin_restore_user(uid)
-- - admin_cancel_trade(trade_id, reason)
-- - admin_set_album_active(album_id, active)
-- - admin_update_album_meta(album_id, name, year)
-- - admin_purge_expired_deletions()  (para cron)

-- 0. Ampliar el CHECK de notifications.kind para incluir 'trade_cancelled_admin'
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check
  check (kind = any (array[
    'trade_received'::text,
    'trade_accepted'::text,
    'trade_rejected'::text,
    'trade_completed'::text,
    'trade_superseded'::text,
    'trade_cancelled'::text,
    'trade_cancelled_admin'::text,
    'duplicate_available'::text
  ]));

-- 1. ban / unban
create or replace function public.admin_set_user_banned(
  p_target uuid,
  p_banned boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_other uuid;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN: solo administradores pueden ejecutar esta acción';
  end if;
  if p_target = v_uid then
    raise exception 'NO_SELF_ACTION: un admin no puede banearse a sí mismo';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'INVALID_TARGET: usuario no existe';
  end if;

  if p_banned then
    update public.profiles
       set banned_at = now(),
           banned_reason = p_reason
     where id = p_target;

    -- Cancelar trades pending/accepted del usuario; notificar al otro
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
    select other_id, 'trade_cancelled_admin', id, jsonb_build_object('reason', p_reason)
      from others;
  else
    update public.profiles
       set banned_at = null,
           banned_reason = null
     where id = p_target;
  end if;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (
         v_uid,
         case when p_banned then 'ban_user' else 'unban_user' end,
         'user',
         p_target,
         jsonb_build_object('reason', p_reason)
       );
end;
$$;

grant execute on function public.admin_set_user_banned(uuid, boolean, text) to authenticated;

-- 2. soft-delete
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

  v_deleted_username := '__deleted_' || substr(encode(gen_random_bytes(4), 'hex'), 1, 8);

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

-- 3. restore
create or replace function public.admin_restore_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target_profile record;
  v_original_username text;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;

  select * into v_target_profile from public.profiles where id = p_target;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;
  if v_target_profile.deleted_at is null then
    raise exception 'ALREADY_IN_STATE: usuario no está borrado';
  end if;
  if v_target_profile.deleted_at < now() - interval '30 days' then
    raise exception 'EXPIRED: el período de restauración (30 días) ya venció';
  end if;

  -- Buscar el username original en el log
  select meta->>'username_original' into v_original_username
    from public.admin_actions
   where action = 'soft_delete_user' and target_id = p_target
   order by created_at desc
   limit 1;

  if v_original_username is null then
    raise exception 'NO_ORIGINAL_USERNAME: no se encontró el username original en el log';
  end if;

  if exists (select 1 from public.profiles where username = v_original_username and id <> p_target) then
    raise exception 'USERNAME_TAKEN: el username % ya está en uso por otro coleccionista', v_original_username;
  end if;

  update public.profiles
     set deleted_at = null,
         is_public_profile = true,
         username = v_original_username
   where id = p_target;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'restore_user', 'user', p_target,
               jsonb_build_object('username_restored', v_original_username));
end;
$$;

grant execute on function public.admin_restore_user(uuid) to authenticated;

-- 4. cancel trade manual
create or replace function public.admin_cancel_trade(
  p_trade_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_trade record;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;

  select * into v_trade from public.trades where id = p_trade_id for update;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;
  if v_trade.status not in ('pending','accepted') then
    raise exception 'ALREADY_IN_STATE: el trade ya no es cancelable (status: %)', v_trade.status;
  end if;

  update public.trades set status = 'cancelled', updated_at = now() where id = p_trade_id;

  insert into public.notifications(user_id, kind, trade_id, meta)
       values
         (v_trade.from_user, 'trade_cancelled_admin', p_trade_id, jsonb_build_object('reason', p_reason)),
         (v_trade.to_user,   'trade_cancelled_admin', p_trade_id, jsonb_build_object('reason', p_reason));

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'cancel_trade', 'trade', p_trade_id, jsonb_build_object('reason', p_reason));
end;
$$;

grant execute on function public.admin_cancel_trade(uuid, text) to authenticated;

-- 5. set album active (uno único activo a la vez)
create or replace function public.admin_set_album_active(
  p_album_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_prev_active uuid;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  if not exists (select 1 from public.albums where id = p_album_id) then
    raise exception 'INVALID_TARGET';
  end if;

  if p_active then
    -- Desactivar el actual activo (si distinto)
    select id into v_prev_active from public.albums where is_active = true and id <> p_album_id limit 1;
    if v_prev_active is not null then
      update public.albums set is_active = false where id = v_prev_active;
    end if;
    update public.albums set is_active = true where id = p_album_id;
  else
    update public.albums set is_active = false where id = p_album_id;
  end if;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'set_album_active', 'album', p_album_id,
               jsonb_build_object('active', p_active, 'prev_active_album', v_prev_active));
end;
$$;

grant execute on function public.admin_set_album_active(uuid, boolean) to authenticated;

-- 6. update album metadata
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
  select name, year into v_prev from public.albums where id = p_album_id;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;

  update public.albums
     set name = coalesce(p_name, name),
         year = coalesce(p_year, year)
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

-- 7. cron: purge soft-deleted >= 30d
create or replace function public.admin_purge_expired_deletions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- Borra de auth.users → cascadea profile + user_stickers + trades + notifications.
  -- admin_actions.actor_id está como ON DELETE SET NULL, por lo que los logs persisten.
  with to_delete as (
    select id from public.profiles
     where deleted_at is not null and deleted_at < now() - interval '30 days'
  )
  delete from auth.users where id in (select id from to_delete);
  get diagnostics v_count = row_count;

  insert into public.admin_actions(actor_id, action, target_kind, meta)
       values (null, 'auto_purge_deleted', 'user', jsonb_build_object('count', v_count));

  return v_count;
end;
$$;

-- pg_cron: corre el 1 de cada mes a las 8am UTC (3am COT)
do $$
begin
  perform cron.unschedule('admin-purge-deleted');
exception when others then null;
end $$;

select cron.schedule(
  'admin-purge-deleted',
  '0 8 1 * *',
  $$select public.admin_purge_expired_deletions();$$
);
