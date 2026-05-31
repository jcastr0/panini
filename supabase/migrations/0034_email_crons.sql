-- Crons para emails: duplicate_available (cada 5 min) y weekly digest (domingo 14:00 UTC).
-- Los placeholders __NEXT_URL__ y __CRON_SECRET__ se reemplazan al aplicar
-- desde test/apply-0034.ts (los valores reales viven en .env.local + Vercel).
-- NO commitear este SQL con valores reales sustituidos.

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Desprogramar si ya existían (idempotente)
DO $$ BEGIN PERFORM cron.unschedule('duplicate_available_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM cron.unschedule('weekly_email_digest'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Cada 5 min: procesa notifications duplicate_available recientes
SELECT cron.schedule(
  'duplicate_available_emails',
  '*/5 * * * *',
  $cron$
    SELECT net.http_get(
      url := '__NEXT_URL__/api/cron/duplicate-emails',
      headers := jsonb_build_object('Authorization', 'Bearer __CRON_SECRET__')
    );
  $cron$
);

-- Domingo 14:00 UTC (9am Colombia): digest semanal
SELECT cron.schedule(
  'weekly_email_digest',
  '0 14 * * SUN',
  $cron$
    SELECT net.http_get(
      url := '__NEXT_URL__/api/cron/weekly-digest',
      headers := jsonb_build_object('Authorization', 'Bearer __CRON_SECRET__')
    );
  $cron$
);
