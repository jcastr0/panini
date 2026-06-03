-- Hace paste_trade_item idempotente: si el receiver ya tiene el cromo
-- pegado manualmente desde fuera del trade (quantity > 0), NO suma de nuevo,
-- solo marca pasted_at. Evita el bug de doble-pegado cuando el user pega
-- desde /album y después clickea "Cerrar" en el banner del trade.

-- DROP necesario porque cambiamos el tipo de retorno (void → jsonb)
DROP FUNCTION IF EXISTS public.paste_trade_item(uuid);

CREATE OR REPLACE FUNCTION public.paste_trade_item(p_trade_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_item record;
  v_receiver uuid;
  v_have int;
  v_already boolean := false;
BEGIN
  SELECT ti.*, t.from_user AS t_from, t.to_user AS t_to, t.status AS t_status
    INTO v_item
    FROM trade_items ti
    JOIN trades t ON t.id = ti.trade_id
   WHERE ti.id = p_trade_item_id
     FOR UPDATE OF ti;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item no encontrado';
  END IF;
  IF v_item.t_status <> 'completed' THEN
    RAISE EXCEPTION 'Solo se pueden pegar items de un trade completado';
  END IF;
  IF v_item.pasted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este cromo ya estaba marcado como pegado';
  END IF;

  IF v_item.direction = 'offer' THEN
    v_receiver := v_item.t_to;
  ELSE
    v_receiver := v_item.t_from;
  END IF;

  IF v_uid IS NULL OR v_uid <> v_receiver THEN
    RAISE EXCEPTION 'Solo el receptor puede pegar este cromo';
  END IF;

  -- ¿El receiver ya tiene el cromo pegado por su cuenta?
  SELECT coalesce(quantity, 0) INTO v_have
    FROM user_stickers
   WHERE user_id = v_receiver AND sticker_id = v_item.sticker_id;

  IF v_have IS NOT NULL AND v_have >= 1 THEN
    -- Ya está pegado en su álbum. Solo cerramos el ritual del trade, no sumamos.
    v_already := true;
  ELSE
    -- No lo tiene: lo sumamos como antes.
    INSERT INTO user_stickers (user_id, sticker_id, quantity)
    VALUES (v_receiver, v_item.sticker_id, v_item.quantity)
    ON CONFLICT (user_id, sticker_id)
    DO UPDATE SET quantity = user_stickers.quantity + EXCLUDED.quantity,
                  updated_at = now();
  END IF;

  UPDATE trade_items SET pasted_at = now() WHERE id = p_trade_item_id;

  RETURN jsonb_build_object('already_in_album', v_already);
END;
$$;

GRANT EXECUTE ON FUNCTION public.paste_trade_item(uuid) TO authenticated;

-- Misma idempotencia para paste_remaining_trade_items
CREATE OR REPLACE FUNCTION public.paste_remaining_trade_items(p_trade_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_trade record;
  v_item record;
  v_receiver uuid;
  v_have int;
  v_count int := 0;
BEGIN
  SELECT * INTO v_trade FROM trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade no encontrado';
  END IF;
  IF v_trade.status <> 'completed' THEN
    RAISE EXCEPTION 'Solo se pueden pegar items de un trade completado';
  END IF;

  FOR v_item IN
    SELECT id, sticker_id, direction, quantity
      FROM trade_items
     WHERE trade_id = p_trade_id AND pasted_at IS NULL
       FOR UPDATE
  LOOP
    IF v_item.direction = 'offer' THEN
      v_receiver := v_trade.to_user;
    ELSE
      v_receiver := v_trade.from_user;
    END IF;

    IF v_uid = v_receiver THEN
      SELECT coalesce(quantity, 0) INTO v_have
        FROM user_stickers
       WHERE user_id = v_receiver AND sticker_id = v_item.sticker_id;

      IF v_have IS NULL OR v_have < 1 THEN
        -- Sumar solo si no lo tenía
        INSERT INTO user_stickers (user_id, sticker_id, quantity)
        VALUES (v_receiver, v_item.sticker_id, v_item.quantity)
        ON CONFLICT (user_id, sticker_id)
        DO UPDATE SET quantity = user_stickers.quantity + EXCLUDED.quantity,
                      updated_at = now();
      END IF;
      UPDATE trade_items SET pasted_at = now() WHERE id = v_item.id;
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.paste_remaining_trade_items(uuid) TO authenticated;
