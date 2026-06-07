-- Añade tipos de intercambio:
--   'swap'  → cromos por cromos (default, comportamiento actual).
--   'gift'  → obsequio: solo items offer del giver, nada del receptor.
--   'sale'  → venta: solo items offer del giver, precio en COP. Acuerdo
--             monetario fuera de la app (WhatsApp), aquí solo se registra.
--
-- gift y sale siguen requiriendo aceptación del receptor (por seguridad
-- contra spam / regalos no deseados). La diferencia es que el receptor
-- NO entrega nada en ese tipo de intercambio.
--
-- price_cents:
--   - sale: REQUERIDO > 0
--   - swap / gift: DEBE ser null
--
-- También se actualiza reconcile_trade para ser type-aware: en gift/sale
-- no hay request items, así que la condición de cancelación es
-- "no queda ningún offer" en vez de "no queda en cada dirección".

ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS trade_type text NOT NULL DEFAULT 'swap'
  CHECK (trade_type IN ('swap', 'gift', 'sale'));

ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS price_cents int CHECK (price_cents IS NULL OR price_cents >= 0);

-- Constraint cruzada: sale exige precio > 0; swap/gift no tienen precio.
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_price_matches_type_chk;
ALTER TABLE public.trades
  ADD CONSTRAINT trades_price_matches_type_chk
  CHECK (
    (trade_type = 'sale' AND price_cents IS NOT NULL AND price_cents > 0)
    OR
    (trade_type IN ('swap', 'gift') AND price_cents IS NULL)
  );

-- Actualizar reconcile_trade para ser consciente del tipo.
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
  v_should_cancel boolean;
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

  SELECT count(*) INTO v_remaining_offer
    FROM trade_items WHERE trade_id = p_trade_id AND direction = 'offer';
  SELECT count(*) INTO v_remaining_request
    FROM trade_items WHERE trade_id = p_trade_id AND direction = 'request';

  -- Cancelar si:
  --   swap: pierde sentido si falta una de las dos direcciones
  --   gift/sale: pierde sentido si no quedan items offer (no hay request por diseño)
  IF v_trade.trade_type = 'swap' THEN
    v_should_cancel := (v_remaining_offer = 0 OR v_remaining_request = 0);
  ELSE
    v_should_cancel := (v_remaining_offer = 0);
  END IF;

  IF v_should_cancel THEN
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

  UPDATE trades SET updated_at = now() WHERE id = p_trade_id;

  RETURN jsonb_build_object(
    'adjusted', v_adjusted,
    'removed', v_removed,
    'auto_cancelled', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_trade(uuid) TO authenticated;
