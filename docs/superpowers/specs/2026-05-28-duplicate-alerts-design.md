# Alertas de cromos repetidos disponibles para trade

**Fecha:** 2026-05-28
**Estado:** Diseño aprobado
**Autor:** Jhonatan + Claude

## Problema

Cuando un coleccionista marca que tiene una repetida (quantity ≥ 2), nadie
se entera. Los matches de trade quedan invisibles hasta que alguien navega
manualmente a /trades/new y ejecuta find_trade_matches. Queremos avisar
proactivamente — pero solo cuando hay match real (no spam) y con debounce
para tolerar clics accidentales.

## Decisiones de producto

| Decisión | Valor |
|---|---|
| Alcance | Solo doble-match real (yo necesito X de él Y él necesita Y de mí) |
| Canal | Campana in-app (no push, no email) |
| Granularidad | Una notif por (owner, sticker) — accionable por cromo |
| Debounce | 30 min después del clic +1, validando que sigue repetida |
| Costo | Cero en Vercel (todo en Supabase free tier) |

## Arquitectura

```
[user_stickers UPDATE quantity 1→2]
      │
      ▼
[trigger SQL]
   UPSERT pending_duplicate_announcements
   (user_id, sticker_id, eligible_at = now() + 30min)
      │
[caso reverso: quantity 2→1 antes de 30min]
   DELETE pending_duplicate_announcements WHERE ...
      │
      ▼
[pg_cron cada 5 min]
   CALL process_pending_announcements()
      │
      ├─ filtra eligible_at <= now() AND processed_at IS NULL
      ├─ verifica quantity >= 2 SIGUE siendo cierto
      ├─ doble-match con perfiles públicos
      └─ INSERT notifications(kind='duplicate_available', ...)
              │
              ▼
[UI campana header polling cada 30s SWR]
```

## Cambios de schema

### Migración `0032_duplicate_alerts.sql`

```sql
-- 1. Extender notifications.kind y agregar columnas
ALTER TABLE notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_kind_check
  CHECK (kind IN (
    'trade_received','trade_accepted','trade_rejected',
    'trade_completed','trade_superseded','trade_cancelled',
    'duplicate_available'
  ));
ALTER TABLE notifications
  ADD COLUMN from_user uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN sticker_id uuid REFERENCES stickers(id) ON DELETE CASCADE;

-- 2. Cola de anuncios pendientes con debounce
CREATE TABLE pending_duplicate_announcements (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_id   uuid NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  eligible_at  timestamptz NOT NULL,
  processed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sticker_id)
);

CREATE INDEX pending_announcements_eligible_idx
  ON pending_duplicate_announcements (eligible_at)
  WHERE processed_at IS NULL;

-- 3. Trigger sobre user_stickers
CREATE FUNCTION track_duplicate_announcement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.quantity >= 2 AND (OLD IS NULL OR OLD.quantity < 2) THEN
    INSERT INTO pending_duplicate_announcements (user_id, sticker_id, eligible_at)
    VALUES (NEW.user_id, NEW.sticker_id, now() + interval '30 minutes')
    ON CONFLICT (user_id, sticker_id) DO UPDATE
      SET eligible_at = EXCLUDED.eligible_at,
          processed_at = NULL;
  ELSIF NEW.quantity < 2 AND OLD.quantity >= 2 THEN
    DELETE FROM pending_duplicate_announcements
      WHERE user_id = NEW.user_id AND sticker_id = NEW.sticker_id
        AND processed_at IS NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER on_user_stickers_quantity_change
  AFTER INSERT OR UPDATE OF quantity ON user_stickers
  FOR EACH ROW EXECUTE FUNCTION track_duplicate_announcement();

-- 4. Función que procesa la cola
CREATE FUNCTION process_pending_announcements()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
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
    WHERE COALESCE(rus.quantity, 0) = 0  -- al receptor le falta
      -- doble-match: receptor tiene al menos 1 repetida que al owner le falta
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
  ),
  inserted AS (
    INSERT INTO notifications (user_id, kind, from_user, sticker_id)
    SELECT receiver_id, 'duplicate_available', owner_id, sticker_id
    FROM candidates
    -- dedupe: no duplicar la misma notif no leída
    WHERE NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = candidates.receiver_id
        AND n.kind = 'duplicate_available'
        AND n.from_user = candidates.owner_id
        AND n.sticker_id = candidates.sticker_id
        AND n.read_at IS NULL
    )
    RETURNING 1
  )
  UPDATE pending_duplicate_announcements
  SET processed_at = now()
  WHERE eligible_at <= now() AND processed_at IS NULL;
END $$;

-- 5. pg_cron jobs
SELECT cron.schedule(
  'process_duplicate_announcements',
  '*/5 * * * *',
  $$SELECT process_pending_announcements();$$
);

SELECT cron.schedule(
  'cleanup_old_announcements',
  '0 3 * * *',  -- 3am diario
  $$DELETE FROM pending_duplicate_announcements
    WHERE processed_at < now() - interval '30 days';$$
);
```

## Componentes frontend

### `src/app/(app)/_components/notification-bell.tsx` (nuevo)

Server component que lee el count unread + las últimas 10. Renderiza:
- Badge con count si > 0
- Dropdown shadcn Popover con la lista
- Cada notif `duplicate_available` linkea a:
  `/trades/new?with={from_user_username}&focus={sticker_code}`

### `src/app/(app)/layout.tsx` (modificar)

Agregar `<NotificationBell />` en el header.

### `src/app/(app)/_components/notification-actions.ts` (nuevo)

Server actions:
- `markAllRead()` → UPDATE notifications SET read_at = now() WHERE user_id = me
- `markRead(id)` → idem por id

### Polling

Hook client `useUnreadCount()` con `setInterval` cada 30s (no SWR para evitar otra dep). Re-fetch via server action que devuelve el count.

## Anti-spam y edge cases

- **Receptor privado** → no se notifica (filtro `is_public_profile`)
- **Owner privado** → no se notifica
- **Notif duplicada** → UNIQUE parcial vía WHERE NOT EXISTS en INSERT
- **Trade creado entre A y B por ese cromo** → la función `accept_trade`
  marca todas las notifs duplicate_available relacionadas como `read_at = now()`
  (adición a la función existente, no es bloqueante para v1)
- **Cromo de tipo `special` (team photo)** → mismo flujo, sin reglas extras

## Costo estimado

| Recurso | Volumen mensual estimado | Capacidad free |
|---|---|---|
| Ejecuciones pg_cron principal | 8,640 (cada 5 min) | ilimitado |
| Ejecuciones pg_cron cleanup | 30 (1 diario) | ilimitado |
| Inserts notifications | ~variable (depende uso) | 500 MB DB |
| Polling clients | 30s × usuarios activos | API calls ilimitados |
| Invocaciones Vercel | 0 (todo SQL) | 100K/mes |

**Costo total adicional: $0.**

## Plan de implementación

1. **Backend** — escribir migración `0032_duplicate_alerts.sql`, aplicarla
   via script tsx (como hicimos con 0031). Verificar con script de smoke:
   - Insertar quantity=2 en test, ver fila pending creada
   - Esperar 30 min (o mover eligible_at manualmente), correr función
   - Ver notif insertada
2. **Helper queries** — `src/lib/queries.ts`:
   - `getUnreadNotificationsCount(userId)`
   - `getRecentNotifications(userId, limit)`
3. **UI** — bell component + integración en layout + acciones
4. **Smoke E2E** — con dos cuentas, marcar repetida con A, esperar (o trigger manual),
   ver notif en B con link funcional
5. **Push a producción**

## Notas para implementación

- El script tsx para aplicar la migración necesita `dotenv` + `pg` ya
  instalados (lo hicimos para `0031`).
- pg_cron requiere extension habilitada en Supabase — verificar antes:
  `CREATE EXTENSION IF NOT EXISTS pg_cron;` (Supabase free lo permite).
- El job runs con privilegios `postgres`, así que `SECURITY DEFINER` en
  las funciones está OK.
