# Panel Admin para paninijd — Design

**Fecha:** 2026-06-07
**Estado:** Aprobado para implementación
**Owner:** Jhonatan (superadmin)

## Contexto y propósito

paninijd es una plataforma de intercambio de cromos Panini Mundial 2026 con ~docenas de usuarios activos. Hasta ahora toda operación administrativa (banear un usuario, cancelar un trade trabado, cambiar metadata de álbumes) se hace por SQL directo contra Supabase. Esto:

- Es lento.
- No deja rastro (auditoría).
- No es accesible desde un dispositivo móvil.
- Bloquea decisiones operativas detrás de una sesión de desarrollo.

El objetivo es crear un panel admin web — **un superadmin (jhonatancp20@gmail.com)** lo opera por ahora, pero el diseño soporta agregar más admins en el futuro vía un flag en DB.

## Alcance (MVP)

**Incluido:**

1. **Dashboard** con KPIs y stats globales (read-only).
2. **Gestión de usuarios:** banear / desbanear / soft-delete / restore. Bloqueo de login para baneados/borrados.
3. **Gestión de intercambios:** lista global con filtros, cancelación manual.
4. **Gestión de álbumes:** activar/desactivar (mutuamente exclusivo), editar metadata (nombre, año).
5. **Auditoría:** log inmutable de toda acción admin.

**Explícitamente fuera del MVP:**

- Crear álbum nuevo desde UI (sigue requiriendo migration con seed).
- Editar cromos individuales del catálogo.
- Broadcast de notificaciones.
- Sistema de reportes de usuarios.
- 2FA para admin (Supabase Auth no lo trae built-in).

## Arquitectura

**Enfoque elegido: RPCs `SECURITY DEFINER` + RLS para lectura.**

- **Escritura:** cada acción admin vive en una RPC Postgres `SECURITY DEFINER` que valida `is_admin(auth.uid())` antes de ejecutar. Mismo patrón que usan ya `accept_trade`, `complete_trade`, `reconcile_trade`.
- **Lectura:** policies RLS adicionales en las tablas existentes (`profiles`, `trades`, `user_stickers`, `notifications`, `admin_actions`) que permiten al admin leer cualquier fila. Las server components del panel admin leen con el client normal del usuario logueado.
- **No se usa `service_role`** en código de aplicación. La lógica de permisos vive en DB para que ningún path nuevo pueda saltarla.

**Razón:** consistente con el patrón actual del proyecto. Si mañana se agrega un webhook o un client adicional, no puede saltarse el check porque está en la RPC.

## Schema (migración `0047_admin.sql`)

### Cambios en `profiles`

```sql
alter table profiles
  add column is_admin       boolean    not null default false,
  add column banned_at      timestamptz,
  add column banned_reason  text,
  add column deleted_at     timestamptz;

-- Solo puede haber 1 admin original; futuros admins se promueven por UPDATE.
update profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'jhonatancp20@gmail.com');
```

### Nueva tabla `admin_actions`

```sql
create table admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  -- actor_id es nullable para 2 razones:
  --   1) Acciones automáticas (cron purge) → actor = null
  --   2) Si el admin se borra a sí mismo en el futuro, conservamos el log
  --      con actor = null en vez de cascadear los registros.
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,         -- 'ban_user', 'unban_user', 'soft_delete_user', 'restore_user',
                                     -- 'cancel_trade', 'set_album_active', 'update_album_meta',
                                     -- 'auto_purge_deleted'
  target_kind text not null,         -- 'user', 'trade', 'album'
  target_id   uuid,
  meta        jsonb,                 -- contexto (razón, valores previos, username original)
  created_at  timestamptz not null default now()
);

create index admin_actions_created_at_idx on admin_actions(created_at desc);
create index admin_actions_actor_idx on admin_actions(actor_id);
create index admin_actions_target_idx on admin_actions(target_kind, target_id);
```

### Helper SQL

```sql
create function is_admin(uid uuid) returns boolean
  language sql stable security definer set search_path = public
  as $$
    select coalesce(
      (select is_admin from profiles where id = uid and deleted_at is null),
      false
    );
  $$;
```

### Policies RLS adicionales

Para cada tabla relevante, agregamos una policy `select using` que el admin pueda leer todo:

- `profiles`: admin lee todos los perfiles (incluyendo baneados/borrados).
- `trades`: admin lee todos los trades.
- `trade_items`: admin lee todos.
- `user_stickers`: admin lee inventarios de cualquiera.
- `notifications`: admin lee notifs de cualquiera.
- `admin_actions`: solo admins leen (no hay policy para no-admins; nadie escribe directo, solo RPCs).

Forma genérica:

```sql
create policy "admin reads all <table>" on <table>
  for select to authenticated
  using (is_admin(auth.uid()));
```

## RPCs admin

Todas las RPCs siguen el mismo patrón:

```sql
create or replace function admin_<action>(...) returns ... as $$
declare
  v_uid uuid := auth.uid();
begin
  if not is_admin(v_uid) then
    raise exception 'NOT_ADMIN: solo administradores pueden ejecutar esta acción';
  end if;

  -- (lógica específica)

  insert into admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, '<action>', '<target_kind>', <target_id>, <meta>);
end;
$$ language plpgsql security definer set search_path = public;
```

### Lista de RPCs

| RPC | Parámetros | Efecto |
|---|---|---|
| `admin_set_user_banned(uid, banned, reason)` | uuid, bool, text | Marca/desmarca `banned_at`. Si banea, cancela trades `pending`/`accepted` del user y notifica al otro con `trade_cancelled_admin`. |
| `admin_soft_delete_user(uid)` | uuid | `deleted_at = now()`, libera username (`__deleted_<8hex>`), `is_public_profile = false`. Cancela trades. Guarda username original en `meta`. |
| `admin_restore_user(uid)` | uuid | Si dentro de 30 días Y username original sigue libre, restaura. Si no, error. |
| `admin_cancel_trade(trade_id, reason)` | uuid, text | Solo si `status IN ('pending','accepted')`. Cancela y notifica a ambos con `trade_cancelled_admin`. |
| `admin_set_album_active(album_id, active)` | uuid, bool | Si activa, primero desactiva los demás (solo uno activo a la vez). |
| `admin_update_album_meta(album_id, name, year)` | uuid, text, int | Actualiza nombre/año. |

### Cron mensual (purge soft-deleted)

```sql
create function admin_purge_expired_deletions() returns int as $$
declare
  v_count int;
begin
  -- Solo procesa los soft-deleted >= 30 días.
  -- Borra de auth.users → cascadea perfil + cromos + trades + notifs.
  with to_delete as (
    select id from profiles where deleted_at is not null and deleted_at < now() - interval '30 days'
  )
  delete from auth.users where id in (select id from to_delete);
  get diagnostics v_count = row_count;

  insert into admin_actions(actor_id, action, target_kind, meta)
       values (null, 'auto_purge_deleted', 'user', jsonb_build_object('count', v_count));

  return v_count;
end;
$$ language plpgsql security definer set search_path = public;

-- pg_cron: corre el 1 de cada mes a las 3am COT
select cron.schedule('admin-purge-deleted', '0 8 1 * *', 'select admin_purge_expired_deletions();');
```

## Bloqueo de baneados y borrados

En `src/app/(app)/layout.tsx`, después de cargar el perfil:

```ts
if (profile.banned_at) redirect('/banned');
if (profile.deleted_at) redirect('/deleted');
```

Páginas:

- `/banned` — muestra "Tu cuenta fue suspendida" + razón si la hay + botón logout + email de contacto.
- `/deleted` — muestra "Tu cuenta fue eliminada. Puedes solicitar restauración antes del [fecha + 30d] escribiendo a soporte@paninijd.lat".

Ambas páginas son public route (fuera de `(app)`) para no entrar en loop de redirect.

## Acceso UI

- **Route group `(admin)`** que envuelve todas las páginas admin.
- **`(admin)/layout.tsx`** guard server-side: si `!is_admin` → `notFound()` (404, no 403, para no leakear la existencia del panel).
- **Link en `UserMenu`** condicional a `profile.is_admin`. Aparece como item adicional con icono `Shield` y label "Panel admin".
- **Subnav del panel**: `Stats · Usuarios · Intercambios · Álbumes · Auditoría`.

## Páginas

### `/admin` — Dashboard

Read-only. Server component que carga 3-5 queries en paralelo:

- KPIs en cards:
  - Total usuarios (activos / baneados / borrados, en líneas separadas)
  - Total trades por status (pending / accepted / completed / cancelled / rejected)
  - Total cromos pegados (sum `user_stickers.quantity` donde quantity ≥ 1)
- Gráfica simple (CSS bars, sin lib externa) de signups últimos 30 días.
- Top 10 coleccionistas por % de progreso (excluyendo borrados/baneados).
- Card "Actividad últimas 24h": n signups, n trades creados, n trades completados.

### `/admin/usuarios`

- Tabla con paginación server-side (50 por página).
- Search por @username o email (text input).
- Filtro de status: `active | banned | deleted | all` (default: `active`).
- Columnas: avatar, @username, email, signup, last activity, progreso %, badge de status.
- Action menu (botón `⋮` por row):
  - Ver perfil público (link a `/u/:username`)
  - Banear / Desbanear → dialog con textarea opcional de razón.
  - Soft-delete → dialog que requiere tipear el `@username` exactamente para confirmar.
  - Restore → solo aparece si `deleted_at` está dentro de 30d.

### `/admin/intercambios`

- Tabla con paginación 50 por página, ordenada por `created_at desc`.
- Filtros:
  - Status (multiselect: pending, accepted, completed, cancelled, rejected)
  - Tipo (swap, gift, sale)
  - Participante (search por @username — busca en from_user o to_user)
  - Rango de fecha (desde / hasta)
- Columnas: id (corto), from @user → to @user, status, type, items, fecha, precio (si sale).
- Action: Cancelar (solo si status `pending`/`accepted`) → dialog con textarea de razón.

### `/admin/albums`

- Lista simple (no es paginada — son pocos).
- Por álbum: nombre, año, total stickers, fecha creación, switch `active`.
- Click en nombre → edit inline (input que reemplaza el texto).
- Click en año → edit inline.
- Switch `active`: cambiar a activo desactiva el actual (con confirm dialog "¿Cambiar el álbum activo a X? Esto afecta a todos los usuarios.")

### `/admin/auditoria`

- Tabla read-only de `admin_actions`, paginada (50 por página), ordenada `created_at desc`.
- Filtros: actor (@username), action (select de todos los kinds), rango de fecha.
- Columnas: cuándo, quién (actor), action (badge), target_kind, target_id (link si aplica), meta (preview JSON expandible).

## Notificaciones nuevas

Una nueva `notification.kind`:

- `trade_cancelled_admin` — el sistema canceló este trade vía admin. El otro participante lo ve en su bell. Si hay razón, va en `meta.reason`.

No requiere email (no es urgente y evita spam de baneos).

## Estructura de archivos

```
src/app/(admin)/
├── layout.tsx                  ← guard is_admin
├── _components/
│   ├── admin-nav.tsx
│   ├── admin-shell.tsx
│   └── confirm-typing-dialog.tsx
├── page.tsx                    ← dashboard
├── usuarios/
│   ├── page.tsx
│   ├── actions.ts              ← banUser, softDeleteUser, restoreUser (llaman RPCs)
│   └── _components/
│       ├── users-table.tsx
│       └── user-row-menu.tsx
├── intercambios/
│   ├── page.tsx
│   ├── actions.ts              ← cancelTradeAdmin
│   └── _components/
│       └── trades-table.tsx
├── albums/
│   ├── page.tsx
│   ├── actions.ts              ← setAlbumActive, updateAlbumMeta
│   └── _components/
│       └── albums-list.tsx
└── auditoria/
    └── page.tsx

src/app/banned/page.tsx
src/app/deleted/page.tsx

supabase/migrations/0047_admin.sql
test/apply-0047.ts
```

Patrón: cada feature folder es server component + actions.ts + componentes client específicos.

## Data flow

### Banear usuario (ejemplo end-to-end)

1. Admin entra a `/admin/usuarios`, ve la lista.
2. Click en `⋮` de un user → "Banear".
3. Dialog client → textarea de razón → submit.
4. `useTransition` llama a server action `banUser({uid, reason})`.
5. Server action obtiene `supabase` cliente del user logueado.
6. Llama `supabase.rpc('admin_set_user_banned', {p_target: uid, p_banned: true, p_reason: reason})`.
7. La RPC valida `is_admin(auth.uid())`, marca el user, cancela sus trades, inserta `admin_actions`, dispara notifs.
8. Server action hace `revalidatePath('/admin/usuarios')` y `revalidatePath('/admin/auditoria')`.
9. UI muestra toast "Usuario baneado" + lista refresca con el badge actualizado.

Si el user baneado intenta entrar después, el guard de `(app)/layout.tsx` lo redirige a `/banned`.

## Manejo de errores

- RPCs lanzan exception `NOT_ADMIN` si falla el check. Server actions traducen a mensaje user-friendly.
- RPCs lanzan exception `INVALID_TARGET` si target no existe.
- RPCs lanzan exception `ALREADY_IN_STATE` si intenta banear un baneado, cancelar un cancelado, etc.
- Server actions retornan `{error: string}` cuando hay falla; UI muestra toast destructivo.

## Testing

Para esta entrega:

- **Aplicar migración con script de verificación** que muestre conteos antes/después, igual que las migraciones recientes (`test/apply-0047.ts`).
- **Probar manualmente cada RPC** con script tipo `test/verify-admin-rpcs.ts` que use service_role para impersonar admin/no-admin y verificar comportamiento.
- **Smoke test manual en UI**: banear/desbanear un user de prueba, soft-delete + restore, cancelar un trade, togglear álbum, validar que las stats se mueven.

## Riesgos identificados

1. **Soft-delete y username conflict**: si Pedro se borra (libera `pedro`) y otra persona se registra como `pedro` en los 30d, Pedro no se puede restaurar. → `admin_restore_user` valida y devuelve error claro.
2. **Cascade hard-delete**: borrar `auth.users` cascadea `user_stickers`, `trades`, `notifications`, `admin_actions.actor_id`. → `admin_actions` debe sobrevivir: cambio el FK a `on delete set null` para que el log persista incluso si el actor se borra.
3. **Admin que se banea a sí mismo**: imposibilitamos en la RPC (`if v_target = v_uid then raise`).

## Plan de implementación (alto nivel)

A definir en detalle en la fase de writing-plans. Orden esperado:

1. Migración 0047 + verify script.
2. Helpers TS (`isAdmin` server-side helper, hook de UserMenu).
3. Páginas /banned y /deleted + guard en layout.
4. Route group `(admin)` + layout + guard + nav.
5. Página dashboard.
6. Página usuarios (la más compleja).
7. Página intercambios.
8. Página álbumes.
9. Página auditoría.
10. Cron de purge.
