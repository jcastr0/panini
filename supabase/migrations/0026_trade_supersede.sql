-- accept_trade(): mover trade a 'accepted' Y auto-rechazar propuestas competidoras
-- que dependan de los mismos cromos del proponente.
--
-- Regla del usuario: si A propuso dar MEX1 y B también pidió MEX1 a este dueño,
-- al aceptar A, la propuesta de B pasa a 'rejected' con rejected_reason='superseded'.
-- B recibe una notification para enterarse.
--
-- Implementación práctica: 'superseded' aplica a OTRAS propuestas pending del
-- mismo from_user (proponente) que comparten al menos un sticker_id de oferta
-- con el trade que acabamos de aceptar. Esto refleja que el proponente no
-- puede entregar dos veces el mismo cromo.

alter table public.trades
  add column if not exists rejected_reason text;

create or replace function public.accept_trade(p_trade_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade record;
  v_uid uuid := auth.uid();
begin
  select * into v_trade from public.trades where id = p_trade_id for update;
  if not found then
    raise exception 'Trade no encontrado';
  end if;
  if v_trade.to_user <> v_uid then
    raise exception 'Solo el receptor puede aceptar';
  end if;
  if v_trade.status <> 'pending' then
    raise exception 'Solo se aceptan propuestas pendientes';
  end if;

  update public.trades
     set status = 'accepted', updated_at = now()
   where id = p_trade_id;

  -- Notificación al proponente
  insert into public.notifications(user_id, kind, trade_id)
  values (v_trade.from_user, 'trade_accepted', p_trade_id);

  -- Auto-rechazar: otras propuestas pending del MISMO proponente que ofrezcan
  -- alguno de los mismos cromos. Se asume que el proponente no podrá entregar
  -- duplicados; el dueño podría querer revisarlas igual, pero por simplicidad
  -- y para evitar confusión cerramos esos competidores.
  with affected as (
    update public.trades t
       set status = 'rejected',
           rejected_reason = 'superseded',
           updated_at = now()
     where t.id <> p_trade_id
       and t.status = 'pending'
       and t.from_user = v_trade.from_user
       and exists (
         select 1
         from public.trade_items ti_other
         join public.trade_items ti_accepted
           on ti_accepted.sticker_id = ti_other.sticker_id
          and ti_accepted.direction = 'offer'
         where ti_other.trade_id = t.id
           and ti_other.direction = 'offer'
           and ti_accepted.trade_id = p_trade_id
       )
     returning t.id, t.from_user
  )
  insert into public.notifications(user_id, kind, trade_id)
  select from_user, 'trade_superseded', id from affected;
end;
$$;

grant execute on function public.accept_trade(uuid) to authenticated;
