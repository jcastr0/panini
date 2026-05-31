# Sistema de notificaciones por email (Resend + React Email)

**Fecha:** 2026-05-30
**Estado:** Diseño aprobado
**Autor:** Jhonatan + Claude

## Problema

Hoy las notificaciones viven solo in-app (campana). Si un usuario no abre
la app por un par de días, se pierde una propuesta de intercambio o un
doble-match. Queremos un canal email vía Resend para los eventos accionables,
con preferencias por tipo, unsubscribe en 1 click y anti-spam.

## Decisiones de producto

| Decisión | Valor |
|---|---|
| Provider | Resend (dominio `paninijd.lat` verificado) |
| Templates | React Email (`@react-email/components` + `render`) |
| Disparador | Server actions directos (sync) + pg_cron (digest semanal) |
| Preferencias | 3 toggles granulares en `profiles` |
| Unsubscribe | Token HMAC en URL + header `List-Unsubscribe` |
| UI prefs | Sección dentro de `/profile` existente |
| Anti-spam | Tabla `email_log` con ventana de dedupe por kind |
| Scope | Un solo spec con 3 fases — implementación incremental |

## Arquitectura

```
         ┌──────────────────────────────┐
         │ src/lib/email/                │
         │   index.ts                    │  sendEmail() público
         │   client.ts                   │  Resend singleton lazy
         │   dedupe.ts                   │  shouldSkipDuplicate()
         │   unsubscribe.ts              │  signToken/verifyToken HMAC
         │   templates/                  │  React Email .tsx
         └──────────────┬───────────────┘
                        │
   ┌────────────────────┼────────────────────────┐
   │                    │                        │
[Server actions]   [pg_cron]                [API routes]
 createTrade        weekly_email_digest      /api/unsubscribe
 updateTradeStatus  cada domingo 14:00 UTC   /api/cron/weekly-digest
                    duplicate_emails         /api/cron/duplicate-emails
                    cada 5 min
```

Cada send pasa por `sendEmail()` que valida pref, dedupe, hace render, agrega
header List-Unsubscribe y registra en `email_log`.

## Cambios de schema (migración `0033_email_notifications.sql`)

### 1. Preferencias por usuario

```sql
ALTER TABLE profiles
  ADD COLUMN email_trades   boolean NOT NULL DEFAULT true,
  ADD COLUMN email_matches  boolean NOT NULL DEFAULT true,
  ADD COLUMN email_digest   boolean NOT NULL DEFAULT true;
```

`DEFAULT true` → usuarios existentes empiezan con todo activo. Pueden
desactivar lo que no quieran desde `/profile` o vía link en cualquier email.

### 2. Tabla `email_log` (dedupe + auditoría)

```sql
CREATE TABLE email_log (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind        text NOT NULL,
  subject_id  uuid,
  resend_id   text,
  sent_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_log_dedupe_idx
  ON email_log (user_id, kind, subject_id, sent_at DESC);
```

### 3. GUCs de PostgreSQL para que pg_cron pueda hacer http_post

```sql
ALTER DATABASE postgres SET app.next_url = 'https://www.paninijd.lat';
ALTER DATABASE postgres SET app.cron_secret = '<random-64-chars>';
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 4. Crons (en migración aparte o al final de 0033)

```sql
-- Digest semanal: domingo 14:00 UTC (9am Colombia)
SELECT cron.schedule(
  'weekly_email_digest',
  '0 14 * * SUN',
  $$
    SELECT net.http_post(
      url := current_setting('app.next_url') || '/api/cron/weekly-digest',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'))
    );
  $$
);

-- Email de duplicate_available: cada 5 min, dispara endpoint que procesa
-- las notifications duplicate_available recientes sin email enviado
SELECT cron.schedule(
  'duplicate_available_emails',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.next_url') || '/api/cron/duplicate-emails',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'))
    );
  $$
);
```

## Ventanas de dedupe por kind

| kind | dedupeHours | razón |
|------|-------------|-------|
| `trade_received` | 0.02 (1 min) | anti race condition |
| `trade_accepted` | 0.02 | idem |
| `trade_rejected` | 0.02 | idem |
| `duplicate_available` | 24 | no spamear el mismo cromo del mismo owner cada 30 min |
| `weekly_digest` | 144 (6 días) | anti-doble cron por la misma semana |

## Unsubscribe — token HMAC

```ts
// payload firmado con HMAC-SHA256(EMAIL_SIGNING_SECRET)
type UnsubscribePayload = {
  u: string;        // user_id
  p: "trades" | "matches" | "digest";  // pref key
  e: number;        // unix expiry (90 días)
};

// URL del email
// https://www.paninijd.lat/api/unsubscribe?token=<base64url(payload)>.<base64url(hmac)>
```

El endpoint `/api/unsubscribe` verifica firma + expiry, hace UPDATE en
profiles, muestra página de confirmación con opción de re-activar.

Cada email también incluye:
```
List-Unsubscribe: <https://www.paninijd.lat/api/unsubscribe?token=...>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

Para que Gmail muestre el botón nativo "Unsubscribe" en la UI del email.

## Templates

Estructura en `src/lib/email/templates/`:

- `_layout.tsx` — hero azul Panini + footer disclaimer + link unsubscribe
- `trade-received.tsx` — "Te propusieron un intercambio"
- `trade-accepted.tsx` — "Aceptaron tu propuesta"
- `trade-rejected.tsx` — "Rechazaron tu propuesta"
- `duplicate-available.tsx` — "Fulano tiene MEX5 repetido — posible match"
- `weekly-digest.tsx` — "Esta semana en tu álbum…"

Render con `@react-email/render` → HTML compatible Gmail/Outlook/Apple Mail.

## Server actions integración

**`createTrade`** (en `src/app/(app)/trades/actions.ts`):
- después del INSERT en trades + trade_items
- `sendEmail({ userId: toUserId, prefKey: 'trades', kind: 'trade_received', subjectId: tradeId, react: <TradeReceivedEmail .../>, ... })`
- catch y log si Resend falla — el flujo de UI no se rompe

**`updateTradeStatus`**:
- después del UPDATE
- según el status: trade_accepted / trade_rejected / etc.
- mismo patrón

## Cron endpoints

### `/api/cron/duplicate-emails`

Protegido por `Authorization: Bearer ${CRON_SECRET}`. Lógica:

```ts
// 1. Lee notifications de kind='duplicate_available' creadas en los últimos
//    10 min (margen de seguridad por si el cron se atrasó)
// 2. Para cada una: verifica pref email_matches del receiver
// 3. Verifica dedupe (24h por sticker_id+from_user)
// 4. sendEmail() con template duplicate-available
```

### `/api/cron/weekly-digest`

Protegido igual. Lógica:

```ts
// 1. Para cada profile con email_digest=true y is_public_profile=true
// 2. Calcula stats de la semana:
//    - propuestas recibidas/enviadas
//    - matches nuevos
//    - cromos pegados/repetidos cambios
//    - visitas a su /u/:username (si tenemos analytics — sino skip)
// 3. Si hay stats interesantes — al menos uno de:
//      - 1+ propuesta recibida o enviada
//      - 1+ cromo nuevo agregado
//      - 1+ match nuevo detectado
//    Si todo es 0 → no mandar email (anti-spam de "no pasó nada")
// 4. Dedupe 6 días por user_id (no subject_id)
```

## UI de preferencias en `/profile`

Nueva sección antes del link a `/amigos`:

```
┌──────────────────────────────────────────────────────┐
│ 📬  Notificaciones por email                          │
│     Te avisamos a tu correo cuando pasen cosas.       │
│                                                       │
│      Intercambios                          ●─━━○      │
│      Propuestas, aceptaciones, rechazos               │
│                                                       │
│      Matches disponibles                   ●─━━○      │
│      Cuando alguien marca repetida que te falta       │
│                                                       │
│      Resumen semanal                       ●─━━○      │
│      Domingos: qué pasó en tu álbum                   │
│                                                       │
│      Tu correo: jhonatan@gmail.com (read-only)        │
└──────────────────────────────────────────────────────┘
```

Server component `/profile/page.tsx`:
- lee `email`, `email_trades`, `email_matches`, `email_digest` del user/profile
- pasa al client component `EmailPreferences`

Client component:
- 3 toggles shadcn `Switch`
- onChange → server action `updateEmailPreferences({ key, value })`
- optimistic update + toast

## Variables de entorno a agregar

| Variable | Donde |
|---|---|
| `RESEND_API_KEY` | Ya está en Vercel |
| `EMAIL_SIGNING_SECRET` | Vercel + .env.local — random 64 chars para HMAC |
| `CRON_SECRET` | Vercel + GUC en DB — autentica pg_cron → Next.js |
| `NEXT_PUBLIC_SITE_URL` | Verificar que apunte a `https://www.paninijd.lat` |

## Plan de implementación por fases

### Fase 1 — Trade emails (~3h)
1. Instalar deps: `resend`, `@react-email/components`, `@react-email/render`
2. Crear migración `0033_email_notifications.sql` (solo columnas profiles + email_log + GUCs, **sin crons todavía**)
3. Aplicar migración
4. Generar `EMAIL_SIGNING_SECRET` y agregar a .env.local (recordar agregar a Vercel)
5. Crear `src/lib/email/` con client, dedupe, unsubscribe, index
6. Crear `_layout.tsx` y 3 templates de trade
7. Integrar `sendEmail()` en `createTrade` y `updateTradeStatus`
8. Smoke test E2E con cuenta demo
9. Commit + push

### Fase 2 — Preferencias + unsubscribe (~2h)
1. Endpoint `/api/unsubscribe/route.ts` + página confirmación
2. Header `List-Unsubscribe` en sendEmail
3. Server action `updateEmailPreferences`
4. Componente cliente `EmailPreferences` en `/profile`
5. Integrar Switch de shadcn si no está
6. Smoke test
7. Commit + push

### Fase 3 — Matches + digest semanal (~3h)
1. Template `duplicate-available.tsx`
2. Endpoint `/api/cron/duplicate-emails` con auth Bearer
3. Template `weekly-digest.tsx`
4. Endpoint `/api/cron/weekly-digest`
5. Crear migración `0034_email_crons.sql` con los 2 cron jobs + extensión pg_net
6. Aplicar migración
7. Smoke test forzando cron manualmente
8. Commit + push

## Anti-spam y consideraciones operacionales

- Free tier Resend: 100 emails/día, 3.000/mes. Suficiente para <50 usuarios activos.
- Si un email a un destinatario rebota (Resend webhook), idealmente desactivamos todas
  sus prefs. Fuera de scope para v1.
- El cron `duplicate_available_emails` corre cada 5 min — es un cron **nuevo y
  separado** del existente `process_duplicate_announcements` (que solo crea
  notifications in-app). El de emails llama al endpoint Next.js que envía vía
  Resend. Si el endpoint tarda >5 min, la siguiente ejecución sobrelapa pero
  es idempotente gracias a `email_log` dedupe (ventana 24h).
- El template digest debe **fallar elegante** si stats está vacío — no mandar email
  diciendo "no pasó nada".

## Costos

| Recurso | Volumen estimado | Capacidad free |
|---|---|---|
| Resend emails | ~50/día (50 usuarios × 1 evento/día promedio) | 100/día |
| pg_cron jobs nuevos | 2 (5min + semanal) | ilimitado en Supabase |
| Vercel functions | ~300/día (3 crons + endpoints UI) | 100K/mes |
| Storage email_log | ~50 rows/día = 1500/mes | despreciable |

**Costo total adicional: $0.**

## Pruebas y validación

- Smoke test por fase: mandar email manual con `npx tsx test/send-test-email.ts`
  reusando script existente
- Verificar List-Unsubscribe aparece en Gmail (botón "Unsubscribe" en header)
- Verificar token HMAC: manipular URL → 400
- Verificar dedupe: enviar mismo email 2 veces → segundo skipped
- Verificar pref OFF: desactivar `email_trades` y hacer un trade → no llega email
- Verificar templates en https://react.email/playground antes de mergear (opcional)

## Out of scope para v1

- Webhooks de Resend (bounces/complaints) → solo loggeamos
- A/B testing de subject lines
- Email digest personalizado por idioma/timezone
- Rich attachments (cromos como adjuntos)
- Re-engagement emails ("hace 30 días que no entras…")
