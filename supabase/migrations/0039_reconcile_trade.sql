-- Ajustar un trade a lo realmente disponible cuando alguna de las partes
-- ya no tiene los cromos prometidos (porque los descartó, los cambió físicamente, etc).
-- Cualquiera de los dos participantes puede ajustarlo.
--
-- Lógica:
--   - Para cada trade_item, si el giver tiene quantity actual < item.quantity:
--     · Si tiene >0 pero menos: reduce el item.quantity a lo disponible
--     · Si tiene 0: borra el item
--   - Si después no queda ningún item en alguna dirección (offer o request),
--     el trade pierde sentido → status = 'cancelled' con notificación a ambos
--   - Si queda al menos un item por dirección: status sigue igual (pending o accepted)
--     y bumpea updated_at para que la UI vea el cambio.
--
-- Solo aplica si status IN ('pending', 'accepted').

CREATE OR REPLACE FUNCTION public.reconcile_trade(p_trade_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade record;
  v_uid uuid := auth.uid();
  v_item record;
  v_giver uuid;
  v_have int;
  v_adjusted int := 0;
  v_removed int := 0;
  v_remaining_offer int;
  v_remaining_request int;
BEGIN
  SELECT * INTO v_trade FROM trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade no encontrado';
  END IF;
  IF v_uid IS NULL OR v_uid NOT IN (v_trade.from_user, v_trade.to_user) THEN
    RAISE EXCEPTION 'Solo los participantes pueden ajustar el trade';
  END IF;
  IF v_trade.status NOT IN ('pending', 'accepted') THEN
    RAISE EXCEPTION 'Solo se ajustan trades pending o accepted (actual: %)', v_trade.status;
  END IF;

  FOR v_item IN
    SELECT id, sticker_id, direction, quantity
      FROM trade_items
     WHERE trade_id = p_trade_id
       FOR UPDATE
  LOOP
    IF v_item.direction = 'offer' THEN
      v_giver := v_trade.from_user;
    ELSE
      v_giver := v_trade.to_user;
    END IF;

    SELECT coalesce(quantity, 0) INTO v_have
      FROM user_stickers
     WHERE user_id = v_giver AND sticker_id = v_item.sticker_id;

    IF v_have >= v_item.quantity THEN
      -- todo bien, sigue
      CONTINUE;
    END IF;

    IF v_have <= 0 THEN
      DELETE FROM trade_items WHERE id = v_item.id;
      v_removed := v_removed + 1;
    ELSE
      UPDATE trade_items SET quantity = v_have WHERE id = v_item.id;
      v_adjusted := v_adjusted + 1;
    END IF;
  END LOOP;

  -- Verificar si quedan items en ambas direcciones
  SELECT count(*) INTO v_remaining_offer
    FROM trade_items WHERE trade_id = p_trade_id AND direction = 'offer';
  SELECT count(*) INTO v_remaining_request
    FROM trade_items WHERE trade_id = p_trade_id AND direction = 'request';

  IF v_remaining_offer = 0 OR v_remaining_request = 0 THEN
    -- El trade ya no tiene sentido
    UPDATE trades SET status = 'cancelled', updated_at = now()
     WHERE id = p_trade_id;
    INSERT INTO notifications(user_id, kind, trade_id)
    VALUES
      (v_trade.from_user, 'trade_cancelled', p_trade_id),
      (v_trade.to_user,   'trade_cancelled', p_trade_id);
    RETURN jsonb_build_object(
      'adjusted', v_adjusted,
      'removed', v_removed,
      'auto_cancelled', true
    );
  END IF;

  -- Sigue válido — bumpear updated_at
  UPDATE trades SET updated_at = now() WHERE id = p_trade_id;

  RETURN jsonb_build_object(
    'adjusted', v_adjusted,
    'removed', v_removed,
    'auto_cancelled', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_trade(uuid) TO authenticated;

-- Actualizar accept_trade para validar disponibilidad antes de aceptar
-- (si hay items no disponibles, falla con error claro pidiendo reconcile)
CREATE OR REPLACE FUNCTION public.accept_trade(p_trade_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade record;
  v_uid uuid := auth.uid();
  v_item record;
  v_giver uuid;
  v_have int;
BEGIN
  SELECT * INTO v_trade FROM trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade no encontrado';
  END IF;
  IF v_uid IS NULL OR v_uid <> v_trade.to_user THEN
    RAISE EXCEPTION 'Solo el receptor puede aceptar el trade';
  END IF;
  IF v_trade.status <> 'pending' THEN
    RAISE EXCEPTION 'El trade ya no está pendiente (status: %)', v_trade.status;
  END IF;

  -- Validar que ambas partes tengan disponibilidad
  FOR v_item IN
    SELECT sticker_id, direction, quantity FROM trade_items WHERE trade_id = p_trade_id
  LOOP
    v_giver := CASE WHEN v_item.direction = 'offer' THEN v_trade.from_user ELSE v_trade.to_user END;
    SELECT coalesce(quantity, 0) INTO v_have
      FROM user_stickers WHERE user_id = v_giver AND sticker_id = v_item.sticker_id;
    IF v_have < v_item.quantity THEN
      RAISE EXCEPTION 'TRADE_OUTDATED: alguno de los dos ya no tiene los cromos prometidos. Ajusta el trade antes de aceptar.';
    END IF;
  END LOOP;

  -- Cancelar otras propuestas pending con cualquier sticker_id en común
  -- (lógica de supersede ya existente, la mantenemos)
  UPDATE trades t
     SET status = 'rejected', updated_at = now()
   WHERE t.status = 'pending'
     AND t.id <> p_trade_id
     AND EXISTS (
       SELECT 1
         FROM trade_items ti_other
         JOIN trade_items ti_this ON ti_this.sticker_id = ti_other.sticker_id
        WHERE ti_other.trade_id = t.id
          AND ti_this.trade_id = p_trade_id
          AND (t.from_user IN (v_trade.from_user, v_trade.to_user)
               OR t.to_user IN (v_trade.from_user, v_trade.to_user))
     );

  -- Notificar a quien le canceló (trade_superseded)
  INSERT INTO notifications(user_id, kind, trade_id)
  SELECT t.from_user, 'trade_superseded', t.id
    FROM trades t
   WHERE t.status = 'rejected'
     AND t.id <> p_trade_id
     AND t.updated_at >= now() - interval '5 seconds';

  -- Aceptar el trade
  UPDATE trades SET status = 'accepted', updated_at = now() WHERE id = p_trade_id;

  INSERT INTO notifications(user_id, kind, trade_id)
  VALUES (v_trade.from_user, 'trade_accepted', p_trade_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_trade(uuid) TO authenticated;
