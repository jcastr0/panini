-- Alertas de cromos repetidos disponibles para trade (doble-match con debounce 30min)
-- Ver docs/superpowers/specs/2026-05-28-duplicate-alerts-design.md

-- 0. Habilitar pg_cron (Supabase free tier lo permite)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Extender notifications.kind y agregar columnas
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_kind_check
  CHECK (kind IN (
    'trade_received','trade_accepted','trade_rejected',
    'trade_completed','trade_superseded','trade_cancelled',
    'duplicate_available'
  ));

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS from_user uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sticker_id uuid REFERENCES stickers(id) ON DELETE CASCADE;

-- 2. Cola de anuncios pendientes con debounce
CREATE TABLE IF NOT EXISTS pending_duplicate_announcements (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_id   uuid NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  eligible_at  timestamptz NOT NULL,
  processed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sticker_id)
);

CREATE INDEX IF NOT EXISTS pending_announcements_eligible_idx
  ON pending_duplicate_announcements (eligible_at)
  WHERE processed_at IS NULL;

-- 3. Trigger sobre user_stickers (1→2 inserta, 2→1 borra)
CREATE OR REPLACE FUNCTION track_duplicate_announcement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF NEW.quantity >= 2 AND (TG_OP = 'INSERT' OR OLD.quantity < 2) THEN
    INSERT INTO pending_duplicate_announcements (user_id, sticker_id, eligible_at)
    VALUES (NEW.user_id, NEW.sticker_id, now() + interval '30 minutes')
    ON CONFLICT (user_id, sticker_id) DO UPDATE
      SET eligible_at = EXCLUDED.eligible_at,
          processed_at = NULL;
  ELSIF TG_OP = 'UPDATE' AND NEW.quantity < 2 AND OLD.quantity >= 2 THEN
    DELETE FROM pending_duplicate_announcements
      WHERE user_id = NEW.user_id AND sticker_id = NEW.sticker_id
        AND processed_at IS NULL;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_user_stickers_quantity_change ON user_stickers;
CREATE TRIGGER on_user_stickers_quantity_change
  AFTER INSERT OR UPDATE OF quantity ON user_stickers
  FOR EACH ROW EXECUTE FUNCTION track_duplicate_announcement();

-- 4. Función que procesa la cola — corre desde pg_cron
CREATE OR REPLACE FUNCTION process_pending_announcements()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Insertar notificaciones para los doble-matches
  WITH eligible AS (
    SELECT pda.user_id AS owner_id, pda.sticker_id
    FROM pending_duplicate_announcements pda
    JOIN user_stickers us
      ON us.user_id = pda.user_id AND us.sticker_id = pda.sticker_id
    JOIN profiles op ON op.id = pda.user_id
    WHERE pda.eligible_at <= now()
      AND pda.processed_at IS NULL
      AND us.quantity >= 2
      AND op.is_public_profile = true
  ),
  candidates AS (
    SELECT
      e.owner_id,
      e.sticker_id,
      rp.id AS receiver_id
    FROM eligible e
    JOIN profiles rp ON rp.is_public_profile = true AND rp.id <> e.owner_id
    LEFT JOIN user_stickers rus
      ON rus.user_id = rp.id AND rus.sticker_id = e.sticker_id
    WHERE COALESCE(rus.quantity, 0) = 0
      AND EXISTS (
        SELECT 1
        FROM user_stickers receiver_dup
        LEFT JOIN user_stickers owner_has
          ON owner_has.user_id = e.owner_id
         AND owner_has.sticker_id = receiver_dup.sticker_id
        WHERE receiver_dup.user_id = rp.id
          AND receiver_dup.quantity >= 2
          AND COALESCE(owner_has.quantity, 0) = 0
      )
  )
  INSERT INTO notifications (user_id, kind, from_user, sticker_id)
  SELECT c.receiver_id, 'duplicate_available', c.owner_id, c.sticker_id
  FROM candidates c
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = c.receiver_id
      AND n.kind = 'duplicate_available'
      AND n.from_user = c.owner_id
      AND n.sticker_id = c.sticker_id
      AND n.read_at IS NULL
  );

  -- Marcar todas las filas eligibles como procesadas
  UPDATE pending_duplicate_announcements
  SET processed_at = now()
  WHERE eligible_at <= now() AND processed_at IS NULL;
END $$;

-- 5. pg_cron jobs (idempotente — desprogramar si ya existe)
DO $$
BEGIN
  PERFORM cron.unschedule('process_duplicate_announcements');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('cleanup_old_announcements');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'process_duplicate_announcements',
  '*/5 * * * *',
  $$SELECT public.process_pending_announcements();$$
);

SELECT cron.schedule(
  'cleanup_old_announcements',
  '0 3 * * *',
  $$DELETE FROM public.pending_duplicate_announcements
    WHERE processed_at < now() - interval '30 days';$$
);
