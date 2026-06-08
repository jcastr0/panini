-- complete_trade(p_auto_paste) afectaba a AMBOS participantes. Si yo cierro
-- y elijo "pegar automáticamente", los cromos del otro también se pegaban
-- sin su consentimiento — yo no tengo derecho a decidir por el otro álbum.
--
-- Cambio: p_auto_paste aplica SOLO a los cromos que el CALLER recibe.
-- Los cromos del otro participante siempre quedan con pasted_at = null,
-- para que él decida con el banner "Pegar este / Pegar todos" cuando entre.

create or replace function public.complete_trade(
  p_trade_id uuid,
  p_auto_paste boolean default true
)
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
  select * into v_trade from trades where id = p_trade_id for update;
  if not found then
    raise exception 'Trade no encontrado';
  end if;
  if v_uid is null or v_uid not in (v_trade.from_user, v_trade.to_user) then
    raise exception 'Solo los participantes pueden completar el intercambio';
  end if;
  if v_trade.status <> 'accepted' then
    raise exception 'El intercambio debe estar aceptado antes de completarse';
  end if;

  for v_item in
    select id, sticker_id, direction, quantity
      from trade_items
     where trade_id = p_trade_id
  loop
    if v_item.direction = 'offer' then
      v_giver    := v_trade.from_user;
      v_receiver := v_trade.to_user;
    else
      v_giver    := v_trade.to_user;
      v_receiver := v_trade.from_user;
    end if;

    -- Verificar que el giver TODAVÍA tiene los cromos prometidos
    select coalesce(quantity, 0) into v_have
      from user_stickers
     where user_id = v_giver and sticker_id = v_item.sticker_id
       for update;

    if v_have is null or v_have < v_item.quantity then
      raise exception 'Cantidad insuficiente: % ya no tiene el cromo %', v_giver, v_item.sticker_id;
    end if;

    -- 1) Siempre quitar del giver (la entrega física sucede sí o sí)
    if v_have = v_item.quantity then
      delete from user_stickers
       where user_id = v_giver and sticker_id = v_item.sticker_id;
    else
      update user_stickers
         set quantity = quantity - v_item.quantity,
             updated_at = now()
       where user_id = v_giver and sticker_id = v_item.sticker_id;
    end if;

    -- 2) Pegar al receiver SOLO si:
    --    - p_auto_paste = true, Y
    --    - el receiver es el CALLER (solo decido por mí mismo)
    if p_auto_paste and v_receiver = v_uid then
      insert into user_stickers (user_id, sticker_id, quantity)
      values (v_receiver, v_item.sticker_id, v_item.quantity)
      on conflict (user_id, sticker_id)
      do update set quantity = user_stickers.quantity + excluded.quantity,
                    updated_at = now();
      update trade_items set pasted_at = now() where id = v_item.id;
    end if;
    -- Si receiver es el OTRO, sus cromos quedan pendientes:
    -- pasted_at = null. Cuando él entre, el banner le mostrará la opción
    -- "Pegar todos" o pegar uno por uno con paste_trade_item.
  end loop;

  -- auto_pasted en la tabla refleja la elección del closer SOLO PARA SÍ.
  -- Esto se sigue usando como flag de "el closer eligió pegar auto", pero
  -- el receiver del otro lado tiene su propia decisión vía el banner.
  update trades
     set status = 'completed',
         updated_at = now(),
         auto_pasted = p_auto_paste
   where id = p_trade_id;

  insert into notifications(user_id, kind, trade_id)
  values
    (v_trade.from_user, 'trade_completed', p_trade_id),
    (v_trade.to_user,   'trade_completed', p_trade_id);
end;
$$;

grant execute on function public.complete_trade(uuid, boolean) to authenticated;
