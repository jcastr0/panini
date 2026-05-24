-- complete_trade(): aplica los movimientos de cromos atómicamente.
-- Cualquiera de los dos participantes puede llamarla cuando el trade esté
-- en 'accepted'. Decrementa qty en el dueño que ofrece y suma al receptor.
--
-- Reglas:
--   * direction='offer'  → from_user pierde N (no puede bajar de 0); to_user gana N
--   * direction='request' → inverso: to_user pierde N; from_user gana N
--   * Si una qty llega a 0 se borra la fila para mantener limpio user_stickers.
--   * Si no hay suficiente cantidad para entregar, falla con error claro
--     y rollback.
-- Notifica a ambos al terminar.

create or replace function public.complete_trade(p_trade_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trade record;
  v_uid uuid := auth.uid();
  v_item record;
  v_giver uuid;
  v_receiver uuid;
  v_have int;
begin
  select * into v_trade from public.trades where id = p_trade_id for update;
  if not found then
    raise exception 'Trade no encontrado';
  end if;
  if v_uid is null or v_uid not in (v_trade.from_user, v_trade.to_user) then
    raise exception 'Solo los participantes pueden completar el intercambio';
  end if;
  if v_trade.status <> 'accepted' then
    raise exception 'El intercambio debe estar aceptado antes de completarse';
  end if;

  -- Iterar items y mover cantidades.
  for v_item in
    select sticker_id, direction, quantity
      from public.trade_items
     where trade_id = p_trade_id
  loop
    if v_item.direction = 'offer' then
      v_giver    := v_trade.from_user;
      v_receiver := v_trade.to_user;
    else
      v_giver    := v_trade.to_user;
      v_receiver := v_trade.from_user;
    end if;

    select coalesce(quantity, 0) into v_have
      from public.user_stickers
     where user_id = v_giver and sticker_id = v_item.sticker_id
       for update;

    if v_have is null or v_have < v_item.quantity then
      raise exception 'Cantidad insuficiente del cromo % en el participante %', v_item.sticker_id, v_giver;
    end if;

    -- Quitar del giver (delete si llega a 0)
    if v_have = v_item.quantity then
      delete from public.user_stickers
       where user_id = v_giver and sticker_id = v_item.sticker_id;
    else
      update public.user_stickers
         set quantity = quantity - v_item.quantity,
             updated_at = now()
       where user_id = v_giver and sticker_id = v_item.sticker_id;
    end if;

    -- Sumar al receiver (upsert)
    insert into public.user_stickers (user_id, sticker_id, quantity)
    values (v_receiver, v_item.sticker_id, v_item.quantity)
    on conflict (user_id, sticker_id)
    do update set quantity = public.user_stickers.quantity + excluded.quantity,
                  updated_at = now();
  end loop;

  update public.trades
     set status = 'completed', updated_at = now()
   where id = p_trade_id;

  -- Notificaciones a ambos participantes
  insert into public.notifications(user_id, kind, trade_id)
  values
    (v_trade.from_user, 'trade_completed', p_trade_id),
    (v_trade.to_user,   'trade_completed', p_trade_id);
end;
$$;

grant execute on function public.complete_trade(uuid) to authenticated;
