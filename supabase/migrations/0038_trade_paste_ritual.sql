-- Permite al receptor del trade ELEGIR si los cromos llegan automáticamente
-- pegados a su álbum, o si quiere mantener el "ritual" de pegarlos uno por uno.
--
-- Schema:
--   trades.auto_pasted        boolean DEFAULT true
--     Lo que el closer eligió al completar. Si true → todos los items quedaron
--     pegados de inmediato. Si false → quedan pendientes del receiver.
--
--   trade_items.pasted_at     timestamptz NULL
--     NULL = cromo aún no pegado en el álbum del receptor (solo si auto_pasted=false).
--     NOT NULL = momento exacto en que el receptor lo pegó (o cuando se completó
--     automáticamente).
--
-- Backfill: para trades existentes ya completados, asumimos que se aplicó
-- el comportamiento "auto_pasted=true" y los items quedaron pegados en el
-- momento de updated_at del trade.

-- 1. Columnas (no destructivas)
ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS auto_pasted boolean NOT NULL DEFAULT true;
ALTER TABLE trade_items
  ADD COLUMN IF NOT EXISTS pasted_at timestamptz;

-- 2. Backfill: trades ya completados → marcar items como pegados retroactivamente
UPDATE trade_items ti
   SET pasted_at = t.updated_at
  FROM trades t
 WHERE ti.trade_id = t.id
   AND t.status = 'completed'
   AND ti.pasted_at IS NULL;

-- 3. Reemplazar complete_trade para aceptar parámetro auto_paste
DROP FUNCTION IF EXISTS public.complete_trade(uuid);
CREATE OR REPLACE FUNCTION public.complete_trade(p_trade_id uuid, p_auto_paste boolean DEFAULT true)
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
  v_receiver uuid;
  v_have int;
BEGIN
  SELECT * INTO v_trade FROM trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade no encontrado';
  END IF;
  IF v_uid IS NULL OR v_uid NOT IN (v_trade.from_user, v_trade.to_user) THEN
    RAISE EXCEPTION 'Solo los participantes pueden completar el intercambio';
  END IF;
  IF v_trade.status <> 'accepted' THEN
    RAISE EXCEPTION 'El intercambio debe estar aceptado antes de completarse';
  END IF;

  FOR v_item IN
    SELECT id, sticker_id, direction, quantity
      FROM trade_items
     WHERE trade_id = p_trade_id
  LOOP
    IF v_item.direction = 'offer' THEN
      v_giver    := v_trade.from_user;
      v_receiver := v_trade.to_user;
    ELSE
      v_giver    := v_trade.to_user;
      v_receiver := v_trade.from_user;
    END IF;

    -- Verificar que el giver TODAVÍA tiene los cromos prometidos
    SELECT coalesce(quantity, 0) INTO v_have
      FROM user_stickers
     WHERE user_id = v_giver AND sticker_id = v_item.sticker_id
       FOR UPDATE;

    IF v_have IS NULL OR v_have < v_item.quantity THEN
      RAISE EXCEPTION 'Cantidad insuficiente: % ya no tiene el cromo %', v_giver, v_item.sticker_id;
    END IF;

    -- 1) Siempre quitar del giver (la entrega física sucede sí o sí)
    IF v_have = v_item.quantity THEN
      DELETE FROM user_stickers
       WHERE user_id = v_giver AND sticker_id = v_item.sticker_id;
    ELSE
      UPDATE user_stickers
         SET quantity = quantity - v_item.quantity,
             updated_at = now()
       WHERE user_id = v_giver AND sticker_id = v_item.sticker_id;
    END IF;

    -- 2) Sumar al receiver SOLO si auto_paste (sino queda pendiente de pegar)
    IF p_auto_paste THEN
      INSERT INTO user_stickers (user_id, sticker_id, quantity)
      VALUES (v_receiver, v_item.sticker_id, v_item.quantity)
      ON CONFLICT (user_id, sticker_id)
      DO UPDATE SET quantity = user_stickers.quantity + EXCLUDED.quantity,
                    updated_at = now();
      -- Marcar item como pegado
      UPDATE trade_items SET pasted_at = now() WHERE id = v_item.id;
    END IF;
  END LOOP;

  UPDATE trades
     SET status = 'completed',
         updated_at = now(),
         auto_pasted = p_auto_paste
   WHERE id = p_trade_id;

  -- Notificaciones a ambos participantes
  INSERT INTO notifications(user_id, kind, trade_id)
  VALUES
    (v_trade.from_user, 'trade_completed', p_trade_id),
    (v_trade.to_user,   'trade_completed', p_trade_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_trade(uuid, boolean) TO authenticated;

-- 4. RPC paste_trade_item: pega UN solo cromo pendiente del trade
CREATE OR REPLACE FUNCTION public.paste_trade_item(p_trade_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_item record;
  v_trade record;
  v_receiver uuid;
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
    RAISE EXCEPTION 'Este cromo ya estaba pegado';
  END IF;

  -- Determinar quién recibe según la dirección
  IF v_item.direction = 'offer' THEN
    v_receiver := v_item.t_to;
  ELSE
    v_receiver := v_item.t_from;
  END IF;

  IF v_uid IS NULL OR v_uid <> v_receiver THEN
    RAISE EXCEPTION 'Solo el receptor puede pegar este cromo';
  END IF;

  -- Sumar al receiver (upsert)
  INSERT INTO user_stickers (user_id, sticker_id, quantity)
  VALUES (v_receiver, v_item.sticker_id, v_item.quantity)
  ON CONFLICT (user_id, sticker_id)
  DO UPDATE SET quantity = user_stickers.quantity + EXCLUDED.quantity,
                updated_at = now();

  UPDATE trade_items SET pasted_at = now() WHERE id = p_trade_item_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.paste_trade_item(uuid) TO authenticated;

-- 5. RPC paste_remaining_trade_items: pega TODOS los pendientes del trade del caller
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

    -- Solo pegamos los items donde el caller es el receiver
    IF v_uid = v_receiver THEN
      INSERT INTO user_stickers (user_id, sticker_id, quantity)
      VALUES (v_receiver, v_item.sticker_id, v_item.quantity)
      ON CONFLICT (user_id, sticker_id)
      DO UPDATE SET quantity = user_stickers.quantity + EXCLUDED.quantity,
                    updated_at = now();
      UPDATE trade_items SET pasted_at = now() WHERE id = v_item.id;
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.paste_remaining_trade_items(uuid) TO authenticated;
