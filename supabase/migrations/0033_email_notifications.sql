-- Email notifications via Resend
-- Ver docs/superpowers/specs/2026-05-30-email-notifications-design.md

-- 1. Toggles de preferencias por usuario (default = activos)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_trades  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_matches boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_digest  boolean NOT NULL DEFAULT true;

-- 2. Tabla email_log para dedupe + auditoría
CREATE TABLE IF NOT EXISTS email_log (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  subject_id  uuid,
  resend_id   text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_log_dedupe_idx
  ON email_log (user_id, kind, subject_id, sent_at DESC);

-- RLS: solo service_role lee/escribe; no se expone a clientes
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
-- Sin políticas → nadie de cliente lee. service_role pasa por RLS bypass.
