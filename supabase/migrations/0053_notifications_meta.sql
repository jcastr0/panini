-- Las RPCs admin (admin_set_user_banned, admin_soft_delete_user,
-- admin_cancel_trade) insertan notifications con un campo `meta` jsonb
-- (razón del cancel, contexto extra). La columna no existía — la agrego.
--
-- Idempotente: re-aplicar es no-op.

alter table public.notifications
  add column if not exists meta jsonb;
