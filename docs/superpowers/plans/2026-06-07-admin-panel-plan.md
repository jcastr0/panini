# Panel Admin paninijd — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar un panel admin web (`/admin`) que permita al superadmin (jhonatancp20@gmail.com) gestionar usuarios (banear, soft-delete, restore), intercambios (cancelación manual), álbumes (toggle activo + edit metadata) y ver dashboard de stats + auditoría inmutable.

**Architecture:** RPCs Postgres `SECURITY DEFINER` para mutaciones (validan `is_admin(auth.uid())` antes de actuar). RLS policies adicionales para que el admin lea cualquier fila desde Server Components con el client normal. Sin `service_role` en código de aplicación. Route group `(admin)` en Next.js App Router con guard server-side.

**Tech Stack:** Next.js 15 App Router · React 19 · Supabase (Postgres + RLS + Auth + pg_cron) · TypeScript · Tailwind v4 · shadcn/ui · Base UI primitives.

**Reference spec:** [docs/superpowers/specs/2026-06-07-admin-panel-design.md](../specs/2026-06-07-admin-panel-design.md)

---

## Convenciones del proyecto (importantes para todas las tareas)

- **Migraciones**: en `supabase/migrations/NNNN_descripcion.sql`. Idempotentes (usar `if not exists`, `create or replace`).
- **Scripts de aplicación**: en `test/apply-NNNN.ts`, usan `pg` con `ssl: { rejectUnauthorized: false }`. Cargan env desde `.env.local`. Se corren con `NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx test/apply-NNNN.ts`.
- **Server actions**: archivo `actions.ts` con `"use server";` al tope. Usan `createClient()` de `@/lib/supabase/server`.
- **Server components**: por default. Reciben `params: Promise<{...}>` y hacen `const { x } = await params`.
- **TS strict**: ningún `any` salvo cuando es necesario por columnas DB no-tipadas → comentar con `// eslint-disable-next-line @typescript-eslint/no-explicit-any` y castear `(supabase as any)`.
- **Commits**: español, formato `tipo(scope): mensaje`, con `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` al final.
- **Push**: el usuario tiene memoria `feedback_push_default` — push directo en cambios UI/UX. Para migraciones DB, push después de verificar.
- **TS check**: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head` debe estar vacío.
- **No ESLint local** (config rota), no se corre.
- **Ley**: nunca destruir data de usuarios (memoria `feedback_no_data_loss`). Antes de cambios DB destructivos, verificar con script lo que pasaría.

---

## Task 1: Migración `0047_admin` — schema base

**Files:**
- Create: `supabase/migrations/0047_admin.sql`
- Create: `test/apply-0047.ts`

- [ ] **Step 1: Crear la migración SQL**

Archivo: `supabase/migrations/0047_admin.sql`

```sql
-- Panel admin: schema base
--   - profiles.is_admin, banned_at, banned_reason, deleted_at
--   - tabla admin_actions (log inmutable)
--   - helper is_admin(uid)
--   - policies RLS para que el admin lea cualquier fila
--
-- Marca a jhonatancp20@gmail.com como primer admin.
-- Idempotente: re-aplicar es no-op.

-- 1. Columnas en profiles
alter table public.profiles add column if not exists is_admin       boolean not null default false;
alter table public.profiles add column if not exists banned_at      timestamptz;
alter table public.profiles add column if not exists banned_reason  text;
alter table public.profiles add column if not exists deleted_at     timestamptz;

create index if not exists profiles_banned_idx  on public.profiles(banned_at)  where banned_at  is not null;
create index if not exists profiles_deleted_idx on public.profiles(deleted_at) where deleted_at is not null;

-- 2. Marcar al superadmin original (idempotente)
update public.profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'jhonatancp20@gmail.com')
   and is_admin = false;

-- 3. Tabla de auditoría
create table if not exists public.admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_kind text not null,
  target_id   uuid,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists admin_actions_created_at_idx on public.admin_actions(created_at desc);
create index if not exists admin_actions_actor_idx      on public.admin_actions(actor_id);
create index if not exists admin_actions_target_idx     on public.admin_actions(target_kind, target_id);

alter table public.admin_actions enable row level security;

-- 4. Helper is_admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = uid and deleted_at is null),
    false
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- 5. Policies RLS adicionales (admin lee todo).
--    No tocamos las policies existentes; las nuevas son OR-additive.
drop policy if exists "admin reads all profiles"      on public.profiles;
create policy "admin reads all profiles" on public.profiles
  for select to authenticated using (public.is_admin(auth.uid()));

drop policy if exists "admin reads all trades" on public.trades;
create policy "admin reads all trades" on public.trades
  for select to authenticated using (public.is_admin(auth.uid()));

drop policy if exists "admin reads all trade_items" on public.trade_items;
create policy "admin reads all trade_items" on public.trade_items
  for select to authenticated using (public.is_admin(auth.uid()));

drop policy if exists "admin reads all user_stickers" on public.user_stickers;
create policy "admin reads all user_stickers" on public.user_stickers
  for select to authenticated using (public.is_admin(auth.uid()));

drop policy if exists "admin reads all notifications" on public.notifications;
create policy "admin reads all notifications" on public.notifications
  for select to authenticated using (public.is_admin(auth.uid()));

drop policy if exists "admin reads all admin_actions" on public.admin_actions;
create policy "admin reads all admin_actions" on public.admin_actions
  for select to authenticated using (public.is_admin(auth.uid()));
```

- [ ] **Step 2: Crear script de aplicación**

Archivo: `test/apply-0047.ts`

```ts
import { Client } from "pg";
import { readFileSync } from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log("Aplicando 0047...");
  const sql = readFileSync("supabase/migrations/0047_admin.sql", "utf8");
  await client.query(sql);
  console.log("OK.");

  console.log("\nColumnas nuevas en profiles:");
  const cols = await client.query(`
    select column_name, data_type, is_nullable, column_default
      from information_schema.columns
     where table_schema='public' and table_name='profiles'
       and column_name in ('is_admin','banned_at','banned_reason','deleted_at')
     order by column_name
  `);
  console.table(cols.rows);

  console.log("\nAdmin actual:");
  const admin = await client.query(`
    select p.username, p.display_name, u.email, p.is_admin
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.is_admin = true
  `);
  console.table(admin.rows);

  console.log("\nTabla admin_actions existe:");
  const t = await client.query(`
    select tablename from pg_tables where schemaname='public' and tablename='admin_actions'
  `);
  console.table(t.rows);

  console.log("\nFunción is_admin:");
  const f = await client.query(`
    select proname from pg_proc where proname='is_admin' and pronamespace = 'public'::regnamespace
  `);
  console.table(f.rows);

  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Aplicar y verificar**

Run: `NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx test/apply-0047.ts 2>&1 | grep -v "Warning\|SECURITY\|next major\|To prepare\|If you\|See https\|Use.*trace" | tail -40`

Expected:
- "OK."
- 4 columnas listadas (is_admin/banned_at/banned_reason/deleted_at)
- 1 admin: `jhonatancp20@gmail.com` con `is_admin: true`
- `admin_actions` tabla existe
- función `is_admin` existe

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0047_admin.sql test/apply-0047.ts
git commit -m "$(cat <<'EOF'
feat(admin): migración schema base (is_admin, ban/delete, audit log)

- profiles: columnas is_admin, banned_at, banned_reason, deleted_at
- nueva tabla admin_actions (log inmutable de acciones admin)
- función is_admin(uid) SECURITY DEFINER para uso en checks de RPCs
- policies RLS adicionales para que admin lea profiles/trades/items/
  user_stickers/notifications/admin_actions
- marca jhonatancp20@gmail.com como primer admin

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 2: Migración `0048_admin_rpcs` — funciones admin

**Files:**
- Create: `supabase/migrations/0048_admin_rpcs.sql`
- Create: `test/apply-0048.ts`

- [ ] **Step 1: Crear la migración con todas las RPCs**

Archivo: `supabase/migrations/0048_admin_rpcs.sql`

```sql
-- RPCs admin. Todas validan is_admin(auth.uid()), insertan en admin_actions.
--
-- - admin_set_user_banned(uid, banned, reason)
-- - admin_soft_delete_user(uid)
-- - admin_restore_user(uid)
-- - admin_cancel_trade(trade_id, reason)
-- - admin_set_album_active(album_id, active)
-- - admin_update_album_meta(album_id, name, year)
-- - admin_purge_expired_deletions()  (para cron)

-- 1. ban / unban
create or replace function public.admin_set_user_banned(
  p_target uuid,
  p_banned boolean,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_other uuid;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN: solo administradores pueden ejecutar esta acción';
  end if;
  if p_target = v_uid then
    raise exception 'NO_SELF_ACTION: un admin no puede banearse a sí mismo';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'INVALID_TARGET: usuario no existe';
  end if;

  if p_banned then
    update public.profiles
       set banned_at = now(),
           banned_reason = p_reason
     where id = p_target;

    -- Cancelar trades pending/accepted del usuario; notificar al otro
    with cancelled as (
      update public.trades
         set status = 'cancelled', updated_at = now()
       where status in ('pending','accepted')
         and (from_user = p_target or to_user = p_target)
      returning id, from_user, to_user
    ),
    others as (
      select id, case when from_user = p_target then to_user else from_user end as other_id
        from cancelled
    )
    insert into public.notifications(user_id, kind, trade_id, meta)
    select other_id, 'trade_cancelled_admin', id, jsonb_build_object('reason', p_reason)
      from others;
  else
    update public.profiles
       set banned_at = null,
           banned_reason = null
     where id = p_target;
  end if;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (
         v_uid,
         case when p_banned then 'ban_user' else 'unban_user' end,
         'user',
         p_target,
         jsonb_build_object('reason', p_reason)
       );
end;
$$;

grant execute on function public.admin_set_user_banned(uuid, boolean, text) to authenticated;

-- 2. soft-delete
create or replace function public.admin_soft_delete_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_username_original text;
  v_deleted_username text;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  if p_target = v_uid then
    raise exception 'NO_SELF_ACTION';
  end if;

  select username into v_username_original from public.profiles where id = p_target;
  if v_username_original is null then
    raise exception 'INVALID_TARGET';
  end if;
  if v_username_original like '__deleted_%' then
    raise exception 'ALREADY_IN_STATE: usuario ya estaba borrado';
  end if;

  v_deleted_username := '__deleted_' || substr(encode(gen_random_bytes(4), 'hex'), 1, 8);

  update public.profiles
     set deleted_at = now(),
         is_public_profile = false,
         username = v_deleted_username
   where id = p_target;

  -- Cancelar trades pending/accepted
  with cancelled as (
    update public.trades
       set status = 'cancelled', updated_at = now()
     where status in ('pending','accepted')
       and (from_user = p_target or to_user = p_target)
    returning id, from_user, to_user
  ),
  others as (
    select id, case when from_user = p_target then to_user else from_user end as other_id
      from cancelled
  )
  insert into public.notifications(user_id, kind, trade_id, meta)
  select other_id, 'trade_cancelled_admin', id, jsonb_build_object('reason', 'usuario eliminado')
    from others;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'soft_delete_user', 'user', p_target,
               jsonb_build_object('username_original', v_username_original));
end;
$$;

grant execute on function public.admin_soft_delete_user(uuid) to authenticated;

-- 3. restore
create or replace function public.admin_restore_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target_profile record;
  v_original_username text;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;

  select * into v_target_profile from public.profiles where id = p_target;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;
  if v_target_profile.deleted_at is null then
    raise exception 'ALREADY_IN_STATE: usuario no está borrado';
  end if;
  if v_target_profile.deleted_at < now() - interval '30 days' then
    raise exception 'EXPIRED: el período de restauración (30 días) ya venció';
  end if;

  -- Buscar el username original en el log
  select meta->>'username_original' into v_original_username
    from public.admin_actions
   where action = 'soft_delete_user' and target_id = p_target
   order by created_at desc
   limit 1;

  if v_original_username is null then
    raise exception 'NO_ORIGINAL_USERNAME: no se encontró el username original en el log';
  end if;

  if exists (select 1 from public.profiles where username = v_original_username and id <> p_target) then
    raise exception 'USERNAME_TAKEN: el username % ya está en uso por otro coleccionista', v_original_username;
  end if;

  update public.profiles
     set deleted_at = null,
         is_public_profile = true,
         username = v_original_username
   where id = p_target;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'restore_user', 'user', p_target,
               jsonb_build_object('username_restored', v_original_username));
end;
$$;

grant execute on function public.admin_restore_user(uuid) to authenticated;

-- 4. cancel trade manual
create or replace function public.admin_cancel_trade(
  p_trade_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_trade record;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;

  select * into v_trade from public.trades where id = p_trade_id for update;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;
  if v_trade.status not in ('pending','accepted') then
    raise exception 'ALREADY_IN_STATE: el trade ya no es cancelable (status: %)', v_trade.status;
  end if;

  update public.trades set status = 'cancelled', updated_at = now() where id = p_trade_id;

  insert into public.notifications(user_id, kind, trade_id, meta)
       values
         (v_trade.from_user, 'trade_cancelled_admin', p_trade_id, jsonb_build_object('reason', p_reason)),
         (v_trade.to_user,   'trade_cancelled_admin', p_trade_id, jsonb_build_object('reason', p_reason));

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'cancel_trade', 'trade', p_trade_id, jsonb_build_object('reason', p_reason));
end;
$$;

grant execute on function public.admin_cancel_trade(uuid, text) to authenticated;

-- 5. set album active (uno único activo a la vez)
create or replace function public.admin_set_album_active(
  p_album_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_prev_active uuid;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  if not exists (select 1 from public.albums where id = p_album_id) then
    raise exception 'INVALID_TARGET';
  end if;

  if p_active then
    -- Desactivar el actual activo (si distinto)
    select id into v_prev_active from public.albums where is_active = true and id <> p_album_id limit 1;
    if v_prev_active is not null then
      update public.albums set is_active = false where id = v_prev_active;
    end if;
    update public.albums set is_active = true where id = p_album_id;
  else
    update public.albums set is_active = false where id = p_album_id;
  end if;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'set_album_active', 'album', p_album_id,
               jsonb_build_object('active', p_active, 'prev_active_album', v_prev_active));
end;
$$;

grant execute on function public.admin_set_album_active(uuid, boolean) to authenticated;

-- 6. update album metadata
create or replace function public.admin_update_album_meta(
  p_album_id uuid,
  p_name text,
  p_year int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_prev record;
begin
  if not public.is_admin(v_uid) then
    raise exception 'NOT_ADMIN';
  end if;
  select name, year into v_prev from public.albums where id = p_album_id;
  if not found then
    raise exception 'INVALID_TARGET';
  end if;

  update public.albums
     set name = coalesce(p_name, name),
         year = coalesce(p_year, year)
   where id = p_album_id;

  insert into public.admin_actions(actor_id, action, target_kind, target_id, meta)
       values (v_uid, 'update_album_meta', 'album', p_album_id,
               jsonb_build_object(
                 'prev_name', v_prev.name,
                 'prev_year', v_prev.year,
                 'new_name', p_name,
                 'new_year', p_year
               ));
end;
$$;

grant execute on function public.admin_update_album_meta(uuid, text, int) to authenticated;

-- 7. cron: purge soft-deleted >= 30d
create or replace function public.admin_purge_expired_deletions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  -- Borra de auth.users → cascadea profile + user_stickers + trades + notifications.
  -- admin_actions.actor_id está como ON DELETE SET NULL, por lo que los logs persisten.
  with to_delete as (
    select id from public.profiles
     where deleted_at is not null and deleted_at < now() - interval '30 days'
  )
  delete from auth.users where id in (select id from to_delete);
  get diagnostics v_count = row_count;

  insert into public.admin_actions(actor_id, action, target_kind, meta)
       values (null, 'auto_purge_deleted', 'user', jsonb_build_object('count', v_count));

  return v_count;
end;
$$;

-- pg_cron: corre el 1 de cada mes a las 8am UTC (3am COT)
do $$
begin
  perform cron.unschedule('admin-purge-deleted');
exception when others then null;
end $$;

select cron.schedule(
  'admin-purge-deleted',
  '0 8 1 * *',
  $$select public.admin_purge_expired_deletions();$$
);
```

- [ ] **Step 2: Crear script de aplicación**

Archivo: `test/apply-0048.ts`

```ts
import { Client } from "pg";
import { readFileSync } from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log("Aplicando 0048...");
  const sql = readFileSync("supabase/migrations/0048_admin_rpcs.sql", "utf8");
  await client.query(sql);
  console.log("OK.");

  console.log("\nRPCs admin creadas:");
  const r = await client.query(`
    select proname, pg_get_function_identity_arguments(oid) as args
      from pg_proc
     where pronamespace = 'public'::regnamespace
       and proname like 'admin_%'
     order by proname
  `);
  console.table(r.rows);

  console.log("\nCron job:");
  const c = await client.query(`
    select jobname, schedule, command from cron.job where jobname = 'admin-purge-deleted'
  `);
  console.table(c.rows);

  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Aplicar y verificar**

Run: `NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx test/apply-0048.ts 2>&1 | grep -v "Warning\|SECURITY\|next major\|To prepare\|If you\|See https\|Use.*trace" | tail -25`

Expected:
- "OK."
- 7 RPCs admin_* listadas: `admin_set_user_banned`, `admin_soft_delete_user`, `admin_restore_user`, `admin_cancel_trade`, `admin_set_album_active`, `admin_update_album_meta`, `admin_purge_expired_deletions`.
- Cron `admin-purge-deleted` con schedule `0 8 1 * *`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0048_admin_rpcs.sql test/apply-0048.ts
git commit -m "$(cat <<'EOF'
feat(admin): RPCs SECURITY DEFINER + cron de purge

6 RPCs admin (ban/unban, soft-delete, restore, cancel-trade,
set-album-active, update-album-meta), todas validan is_admin y
escriben en admin_actions. Notificación trade_cancelled_admin a los
participantes cuando un trade se cancela vía admin.

Cron mensual (1ro de cada mes, 8am UTC) borra definitivamente los
soft-deleted >= 30d. Cascade desde auth.users.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 3: Guard de baneados/borrados + páginas `/banned` y `/deleted`

**Files:**
- Create: `src/app/banned/page.tsx`
- Create: `src/app/deleted/page.tsx`
- Modify: `src/app/(app)/layout.tsx` — añadir guards después de cargar profile

- [ ] **Step 1: Crear `/banned/page.tsx`**

Archivo: `src/app/banned/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export default async function BannedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("banned_at, banned_reason, display_name, username")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: {
      banned_at: string | null;
      banned_reason: string | null;
      display_name: string | null;
      username: string | null;
    } | null;
  };

  // Si por algún motivo no está baneado, lo mandamos al app
  if (!profile?.banned_at) redirect("/dashboard");

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6">
      <ShieldAlert className="size-16 mx-auto text-[var(--panini-red)]" />
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Cuenta suspendida
      </h1>
      <p className="text-muted-foreground">
        Tu cuenta {profile.display_name || `@${profile.username}`} fue
        suspendida por la administración.
      </p>
      {profile.banned_reason && (
        <div className="border-l-4 border-[var(--panini-red)] bg-card p-4 text-left text-sm">
          <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Razón
          </p>
          <p>{profile.banned_reason}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Si crees que es un error, escribe a{" "}
        <a href="mailto:soporte@paninijd.lat" className="underline">
          soporte@paninijd.lat
        </a>
        .
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Crear `/deleted/page.tsx`**

Archivo: `src/app/deleted/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export default async function DeletedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = (await (supabase as any)
    .from("profiles")
    .select("deleted_at, display_name")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: { deleted_at: string | null; display_name: string | null } | null;
  };

  if (!profile?.deleted_at) redirect("/dashboard");

  const restoreDeadline = new Date(profile.deleted_at);
  restoreDeadline.setDate(restoreDeadline.getDate() + 30);

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6">
      <Trash2 className="size-16 mx-auto text-muted-foreground" />
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Cuenta eliminada
      </h1>
      <p className="text-muted-foreground">
        Tu cuenta fue eliminada de paninijd. Puedes solicitar restauración
        antes del{" "}
        <span className="font-semibold text-foreground">
          {restoreDeadline.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "America/Bogota",
          })}
        </span>{" "}
        escribiendo a{" "}
        <a href="mailto:soporte@paninijd.lat" className="underline">
          soporte@paninijd.lat
        </a>
        .
      </p>
      <p className="text-xs text-muted-foreground">
        Pasada esa fecha, tu cuenta y todo su contenido serán borrados
        permanentemente.
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Añadir guards en `(app)/layout.tsx`**

Modify: `src/app/(app)/layout.tsx`

Localiza el bloque que carga `profileQ` y `pendingTrades` (alrededor de la línea 22-35). Después del cast `as any` del profile y antes del `locationMissing`, añade los guards:

```tsx
  // (existing code: profile cast)
  const profile = profileQ.data as any;
  const p = profile;

  // Guards admin: usuario baneado o borrado → fuera del app
  if (p?.banned_at) redirect("/banned");
  if (p?.deleted_at) redirect("/deleted");

  // (existing code continues with locationMissing check)
```

Importante: el `.select` actual del profile NO trae `banned_at`/`deleted_at`. Hay que extender el SELECT:

Busca en el archivo:
```ts
.select(
  "username, display_name, avatar_url, collector_card_base64, country, department, city, phone",
)
```

Reemplaza por:
```ts
.select(
  "username, display_name, avatar_url, collector_card_base64, country, department, city, phone, is_admin, banned_at, deleted_at",
)
```

- [ ] **Step 4: Replicar el mismo cambio en `src/app/u/[username]/layout.tsx`**

El layout público también carga el profile del usuario actual. Aplica el mismo SELECT extendido y los mismos guards (banned → /banned, deleted → /deleted) inmediatamente después del cast.

- [ ] **Step 5: Verificar TS**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

- [ ] **Step 6: Commit**

```bash
git add src/app/banned/page.tsx src/app/deleted/page.tsx src/app/\(app\)/layout.tsx src/app/u/\[username\]/layout.tsx
git commit -m "$(cat <<'EOF'
feat(admin): páginas /banned y /deleted + guard en layouts

Cuando un usuario tiene banned_at o deleted_at, los layouts (app) y
/u/* lo redirigen a una página explicativa con logout y email de
contacto. Sin loop porque ambas páginas viven fuera de los layouts
guardados.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 4: Helpers admin + link en UserMenu

**Files:**
- Create: `src/lib/admin/is-admin.ts`
- Modify: `src/app/(app)/_components/user-menu.tsx` — añadir prop `isAdmin` y item condicional
- Modify: `src/app/(app)/layout.tsx` — pasar isAdmin al UserMenu
- Modify: `src/app/u/[username]/layout.tsx` — pasar isAdmin al UserMenu

- [ ] **Step 1: Crear helper server-side**

Archivo: `src/lib/admin/is-admin.ts`

```ts
import { createClient } from "@/lib/supabase/server";

/**
 * Verifica si el usuario actual es admin. Llama al RPC is_admin de DB
 * para que la lógica de qué cuenta como admin viva en un solo sitio.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("is_admin", {
    uid: user.id,
  });
  if (error) return false;
  return data === true;
}
```

- [ ] **Step 2: Modificar `UserMenu` para aceptar `isAdmin`**

Modify: `src/app/(app)/_components/user-menu.tsx`

Actualizar la firma del componente:

```tsx
import { Heart, HelpCircle, LogOut, Shield, User } from "lucide-react";
// ... resto de imports
import Link from "next/link";

export function UserMenu({
  email,
  username,
  displayName,
  avatarUrl,
  collectorCardBase64,
  isAdmin = false,
}: {
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  collectorCardBase64: string | null;
  isAdmin?: boolean;
}) {
  // ... resto idéntico
```

Dentro del `<DropdownMenuContent>`, después del separator que sigue al label y antes del primer `<DropdownMenuItem>` (Mi perfil), añadir el item condicional:

```tsx
{isAdmin && (
  <>
    <DropdownMenuItem asChild>
      <Link href="/admin" className="cursor-pointer">
        <Shield className="mr-2 size-4 text-[var(--panini-blue)]" />
        Panel admin
      </Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
  </>
)}
<DropdownMenuItem onClick={() => router.push("/profile")}>
  <User className="mr-2 size-4" /> Mi perfil
</DropdownMenuItem>
```

- [ ] **Step 3: Pasar `isAdmin` desde los layouts**

Modify: `src/app/(app)/layout.tsx`

En la invocación de `<UserMenu>`, añadir la prop:

```tsx
<UserMenu
  email={user.email ?? ""}
  username={profile?.username ?? ""}
  displayName={profile?.display_name ?? null}
  avatarUrl={profile?.avatar_url ?? null}
  collectorCardBase64={profile?.collector_card_base64 ?? null}
  isAdmin={p?.is_admin === true}
/>
```

Modify: `src/app/u/[username]/layout.tsx` — mismo cambio en su `<UserMenu>`.

- [ ] **Step 4: Verificar TS**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

- [ ] **Step 5: Smoke test manual**

- Levantar dev: `pnpm dev`
- Loguearse como `jhonatancp20@gmail.com` → en el avatar dropdown debe aparecer "Panel admin".
- Loguearse como otro user → NO debe aparecer.

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/is-admin.ts src/app/\(app\)/_components/user-menu.tsx src/app/\(app\)/layout.tsx src/app/u/\[username\]/layout.tsx
git commit -m "$(cat <<'EOF'
feat(admin): link "Panel admin" en UserMenu solo para admins

Helper currentUserIsAdmin() server-side que delega al RPC is_admin
(una sola fuente de verdad). UserMenu recibe prop isAdmin y renderiza
condicionalmente un item con icono Shield que lleva a /admin.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 5: Route group `(admin)` con guard + shell

**Files:**
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/_components/admin-nav.tsx`
- Create: `src/app/(admin)/page.tsx` — placeholder por ahora (Task 6 lo completa)

- [ ] **Step 1: Crear layout con guard**

Archivo: `src/app/(admin)/layout.tsx`

```tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentUserIsAdmin } from "@/lib/admin/is-admin";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ok = await currentUserIsAdmin();
  if (!ok) notFound();

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">
          <span className="eyebrow">Panel admin</span>
          <AdminNav />
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Crear `AdminNav`**

Archivo: `src/app/(admin)/_components/admin-nav.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileClock, Repeat, Users, BookOpen } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Stats", icon: BarChart3 },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/intercambios", label: "Intercambios", icon: Repeat },
  { href: "/admin/albums", label: "Álbumes", icon: BookOpen },
  { href: "/admin/auditoria", label: "Auditoría", icon: FileClock },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 text-sm">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 3: Placeholder de `/admin`**

Archivo: `src/app/(admin)/page.tsx`

```tsx
export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="text-muted-foreground">Próximamente — stats globales.</p>
    </div>
  );
}
```

- [ ] **Step 4: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke (con `pnpm dev`):
- Como admin → `/admin` carga con la nav y el placeholder.
- Como no-admin → `/admin` da 404.
- Sin sesión → `/admin` redirige a login.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/layout.tsx src/app/\(admin\)/_components/admin-nav.tsx src/app/\(admin\)/page.tsx
git commit -m "$(cat <<'EOF'
feat(admin): route group (admin) con guard server-side + nav

Guard usa currentUserIsAdmin → si !admin devuelve notFound (404, no
403, para no leakear la existencia del panel). Nav con 5 links
(Stats, Usuarios, Intercambios, Álbumes, Auditoría).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 6: Dashboard de stats (`/admin`)

**Files:**
- Modify: `src/app/(admin)/page.tsx` — reemplazar placeholder con dashboard real
- Create: `src/app/(admin)/_components/stat-card.tsx`
- Create: `src/app/(admin)/_components/signups-chart.tsx`

- [ ] **Step 1: Crear `StatCard` (server component visual reutilizable)**

Archivo: `src/app/(admin)/_components/stat-card.tsx`

```tsx
export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: "blue" | "gold" | "red" | "green";
}) {
  const accentColor =
    accent === "blue"
      ? "var(--panini-blue)"
      : accent === "gold"
        ? "var(--gold)"
        : accent === "red"
          ? "var(--panini-red)"
          : accent === "green"
            ? "rgb(16 185 129)"
            : "var(--foreground)";
  return (
    <div className="border rounded-xl bg-card p-5 space-y-2">
      <p className="eyebrow">{label}</p>
      <p
        className="font-display text-3xl font-bold tabular leading-none"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Crear gráfica de signups (server component con bars CSS)**

Archivo: `src/app/(admin)/_components/signups-chart.tsx`

```tsx
export function SignupsChart({ days }: { days: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="border rounded-xl bg-card p-5 space-y-3">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Signups últimos 30 días
      </h2>
      <div className="grid grid-cols-30 gap-0.5 items-end h-32" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
        {days.map((d) => {
          const h = (d.count / max) * 100;
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count}`}
              className="bg-[var(--panini-blue)] rounded-sm transition-all hover:opacity-80"
              style={{ height: `${Math.max(2, h)}%` }}
            />
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground tabular flex justify-between">
        <span>{days[0]?.date ?? ""}</span>
        <span>{days[days.length - 1]?.date ?? ""}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Reescribir `page.tsx` con queries en paralelo**

Archivo: `src/app/(admin)/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "./_components/stat-card";
import { SignupsChart } from "./_components/signups-chart";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    usersCount,
    bannedCount,
    deletedCount,
    tradesByStatus,
    stuckCount,
    signupsRaw,
    activity24h,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is("banned_at" as any, null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .is("deleted_at" as any, null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .not("banned_at" as any, "is", null),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .not("deleted_at" as any, "is", null),
    supabase.from("trades").select("status"),
    supabase
      .from("user_stickers")
      .select("quantity", { count: "exact", head: true })
      .gte("quantity", 1),
    // Signups por día (últimos 30 días)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc("get_admin_signups_per_day", { p_days: 30 }),
    Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
      supabase
        .from("trades")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("updated_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
    ]),
  ]);

  const statusCounts: Record<string, number> = {
    pending: 0,
    accepted: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };
  for (const row of (tradesByStatus.data ?? []) as Array<{ status: string }>) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const signups = (signupsRaw.data ?? []) as Array<{ day: string; n: number }>;
  const signupBars = signups.map((s) => ({
    date: s.day.slice(5), // MM-DD
    count: Number(s.n) || 0,
  }));

  const [newSignups, newTrades, newCompletes] = activity24h;

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Usuarios activos"
          value={(usersCount.count ?? 0).toLocaleString("es-CO")}
          hint={`${bannedCount.count ?? 0} baneados · ${deletedCount.count ?? 0} borrados`}
          accent="blue"
        />
        <StatCard
          label="Trades pending"
          value={statusCounts.pending}
          hint={`${statusCounts.accepted} accepted`}
          accent="gold"
        />
        <StatCard
          label="Trades completados"
          value={statusCounts.completed}
          hint={`${statusCounts.cancelled + statusCounts.rejected} cancelados/rechazados`}
          accent="green"
        />
        <StatCard
          label="Cromos en circulación"
          value={(stuckCount.count ?? 0).toLocaleString("es-CO")}
          hint="filas user_stickers con qty ≥ 1"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Signups 24h"
          value={newSignups.count ?? 0}
          accent="blue"
        />
        <StatCard
          label="Trades creados 24h"
          value={newTrades.count ?? 0}
          accent="gold"
        />
        <StatCard
          label="Trades completados 24h"
          value={newCompletes.count ?? 0}
          accent="green"
        />
      </section>

      <SignupsChart days={signupBars} />
    </div>
  );
}
```

- [ ] **Step 4: Crear la RPC `get_admin_signups_per_day` (migración 0049)**

Archivo: `supabase/migrations/0049_admin_dashboard_rpcs.sql`

```sql
-- RPCs que sirven series temporales para el dashboard admin.

create or replace function public.get_admin_signups_per_day(p_days int default 30)
returns table(day date, n bigint)
language sql
stable
security definer
set search_path = public
as $$
  with days as (
    select generate_series(
      (current_date - (p_days - 1))::date,
      current_date,
      interval '1 day'
    )::date as day
  )
  select d.day,
         coalesce(count(p.id), 0) as n
    from days d
    left join public.profiles p
      on p.created_at::date = d.day
   group by d.day
   order by d.day asc;
$$;

grant execute on function public.get_admin_signups_per_day(int) to authenticated;
```

Crear script `test/apply-0049.ts` (copia del patrón de apply-0048.ts, mismo skeleton, aplica `0049_admin_dashboard_rpcs.sql` y verifica que la función exista) y correrlo igual.

- [ ] **Step 5: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke (`pnpm dev`):
- `/admin` muestra los cards con números reales.
- La gráfica de signups muestra barras (puede haber días en cero).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0049_admin_dashboard_rpcs.sql test/apply-0049.ts src/app/\(admin\)/page.tsx src/app/\(admin\)/_components/stat-card.tsx src/app/\(admin\)/_components/signups-chart.tsx
git commit -m "$(cat <<'EOF'
feat(admin): dashboard con KPIs + gráfica de signups

7 cards con totals (users activos/baneados/borrados, trades por
status, cromos en circulación, actividad 24h). Gráfica CSS-only de
signups últimos 30 días. Nueva RPC get_admin_signups_per_day.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 7: Página `/admin/usuarios` con ban / soft-delete / restore

**Files:**
- Create: `src/app/(admin)/usuarios/page.tsx`
- Create: `src/app/(admin)/usuarios/actions.ts`
- Create: `src/app/(admin)/usuarios/_components/users-table.tsx`
- Create: `src/app/(admin)/usuarios/_components/user-row-menu.tsx`
- Create: `src/app/(admin)/_components/confirm-typing-dialog.tsx`

- [ ] **Step 1: Crear server actions**

Archivo: `src/app/(admin)/usuarios/actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function bumpAdminPaths() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin");
}

const banSchema = z.object({
  user_id: z.string().uuid(),
  banned: z.boolean(),
  reason: z.string().max(500).optional().nullable(),
});

export async function setUserBanned(input: z.infer<typeof banSchema>) {
  const parsed = banSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_set_user_banned", {
    p_target: parsed.data.user_id,
    p_banned: parsed.data.banned,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}

export async function softDeleteUser(input: { user_id: string }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_soft_delete_user", {
    p_target: input.user_id,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}

export async function restoreUser(input: { user_id: string }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_restore_user", {
    p_target: input.user_id,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}
```

- [ ] **Step 2: Crear `ConfirmTypingDialog` (cliente, reutilizable)**

Archivo: `src/app/(admin)/_components/confirm-typing-dialog.tsx`

```tsx
"use client";

import * as React from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { Button } from "@/components/ui/button";

/**
 * Dialog destructivo que requiere que el admin tipee una palabra
 * exacta (típicamente el @username) para confirmar.
 */
export function ConfirmTypingDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  destructiveLabel,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  destructiveLabel: string;
  onConfirm: () => void;
  pending: boolean;
}) {
  const [typed, setTyped] = React.useState("");
  React.useEffect(() => {
    if (!open) setTyped("");
  }, [open]);
  const ok = typed === confirmText;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
          <Dialog.Title className="font-display text-xl font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground">
            {description}
          </Dialog.Description>
          <div className="space-y-2">
            <label className="eyebrow block">
              Tipea <span className="font-mono">{confirmText}</span> para confirmar
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!ok || pending}
              onClick={onConfirm}
            >
              {pending ? "Procesando…" : destructiveLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 3: Crear `UserRowMenu` (cliente con dialogs)**

Archivo: `src/app/(admin)/usuarios/_components/user-row-menu.tsx`

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useTransition } from "react";
import { Dialog } from "@base-ui-components/react/dialog";
import { ExternalLink, MoreVertical, Shield, ShieldOff, Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmTypingDialog } from "../../_components/confirm-typing-dialog";
import { restoreUser, setUserBanned, softDeleteUser } from "../actions";

type Row = {
  id: string;
  username: string;
  display_name: string | null;
  status: "active" | "banned" | "deleted";
  deleted_at: string | null;
};

export function UserRowMenu({ row }: { row: Row }) {
  const [banOpen, setBanOpen] = React.useState(false);
  const [banReason, setBanReason] = React.useState("");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [pending, startTransition] = useTransition();

  const isBanned = row.status === "banned";
  const isDeleted = row.status === "deleted";

  // restore solo si dentro de 30 días
  const canRestore =
    isDeleted &&
    row.deleted_at &&
    Date.now() - new Date(row.deleted_at).getTime() < 30 * 24 * 3600 * 1000;

  function doBan() {
    startTransition(async () => {
      const res = await setUserBanned({
        user_id: row.id,
        banned: !isBanned,
        reason: banReason.trim() || null,
      });
      if (res?.error) toast.error(res.error);
      else toast.success(isBanned ? "Usuario desbaneado" : "Usuario baneado");
      setBanOpen(false);
      setBanReason("");
    });
  }

  function doDelete() {
    startTransition(async () => {
      const res = await softDeleteUser({ user_id: row.id });
      if (res?.error) toast.error(res.error);
      else toast.success("Usuario marcado como eliminado");
      setDeleteOpen(false);
    });
  }

  function doRestore() {
    startTransition(async () => {
      const res = await restoreUser({ user_id: row.id });
      if (res?.error) toast.error(res.error);
      else toast.success("Usuario restaurado");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isDeleted && (
            <DropdownMenuItem asChild>
              <Link href={`/u/${row.username}`} target="_blank">
                <ExternalLink className="mr-2 size-4" /> Ver perfil
              </Link>
            </DropdownMenuItem>
          )}
          {!isDeleted && (
            <DropdownMenuItem onClick={() => setBanOpen(true)}>
              {isBanned ? (
                <>
                  <ShieldOff className="mr-2 size-4" /> Desbanear
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" /> Banear
                </>
              )}
            </DropdownMenuItem>
          )}
          {!isDeleted && (
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 size-4 text-[var(--panini-red)]" />
              Eliminar
            </DropdownMenuItem>
          )}
          {canRestore && (
            <DropdownMenuItem onClick={doRestore}>
              <Undo2 className="mr-2 size-4" /> Restaurar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Ban */}
      <Dialog.Root open={banOpen} onOpenChange={setBanOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <Dialog.Title className="font-display text-xl font-semibold">
              {isBanned ? "Desbanear usuario" : "Banear usuario"}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {isBanned
                ? `Permitir que ${row.display_name || "@" + row.username} vuelva a entrar.`
                : `Bloquear a ${row.display_name || "@" + row.username} y cancelar sus trades en curso.`}
            </Dialog.Description>
            {!isBanned && (
              <div className="space-y-1.5">
                <label className="eyebrow block">Razón (opcional)</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Conducta inapropiada, fraude reportado, etc."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setBanOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant={isBanned ? "default" : "destructive"}
                disabled={pending}
                onClick={doBan}
              >
                {pending ? "Procesando…" : isBanned ? "Desbanear" : "Banear"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog Soft-Delete (con typing del @username) */}
      <ConfirmTypingDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar usuario"
        description={
          <>
            Marca al usuario como eliminado. Sus trades activos se cancelan y
            su <span className="font-mono">@{row.username}</span> queda
            liberado. Se puede restaurar dentro de 30 días.
          </>
        }
        confirmText={`@${row.username}`}
        destructiveLabel="Eliminar"
        pending={pending}
        onConfirm={doDelete}
      />
    </>
  );
}
```

- [ ] **Step 4: Crear `UsersTable` (cliente, recibe rows del server)**

Archivo: `src/app/(admin)/usuarios/_components/users-table.tsx`

```tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRowMenu } from "./user-row-menu";

export type AdminUserRow = {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  status: "active" | "banned" | "deleted";
  deleted_at: string | null;
  is_admin: boolean;
};

const STATUS_BADGE: Record<AdminUserRow["status"], { label: string; cls: string }> = {
  active: { label: "Activo", cls: "bg-emerald-100 text-emerald-700" },
  banned: { label: "Baneado", cls: "bg-[var(--panini-red)]/15 text-[var(--panini-red)]" },
  deleted: { label: "Borrado", cls: "bg-muted text-muted-foreground" },
};

export function UsersTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminUserRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = React.useState(sp.get("q") ?? "");
  const [status, setStatus] = React.useState(sp.get("status") ?? "active");

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.set("status", status);
    params.set("page", "1");
    router.push(`/admin/usuarios?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/usuarios?${params.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            placeholder="Buscar por @username o email"
            className="w-full h-10 pl-10 pr-3 rounded-full border bg-card text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border bg-card px-3 text-sm"
        >
          <option value="active">Activos</option>
          <option value="banned">Baneados</option>
          <option value="deleted">Borrados</option>
          <option value="all">Todos</option>
        </select>
        <button
          type="button"
          onClick={applyFilters}
          className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium"
        >
          Aplicar
        </button>
      </div>

      {/* Tabla */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Usuario</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium tabular">Signup</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <div className="font-medium">
                    {r.display_name || `@${r.username}`}
                    {r.is_admin && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--panini-blue)]/15 text-[var(--panini-blue)] font-semibold">
                        admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    @{r.username}
                  </div>
                </td>
                <td className="px-3 py-2 truncate max-w-[200px]" title={r.email ?? ""}>
                  {r.email ?? "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2">
                  <Badge className={STATUS_BADGE[r.status].cls} variant="outline">
                    {STATUS_BADGE[r.status].label}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <UserRowMenu row={r} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalCount.toLocaleString("es-CO")} resultados · página {page} de{" "}
            {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="h-8 px-3 rounded-md border bg-card disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="h-8 px-3 rounded-md border bg-card disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Crear `page.tsx` con la query server-side**

Archivo: `src/app/(admin)/usuarios/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { UsersTable, type AdminUserRow } from "./_components/users-table";

const PAGE_SIZE = 50;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status = "active", page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  // Query profiles + email desde auth.users. Como no tenemos JOIN
  // directo, hacemos 2 queries: filtrar profiles primero, luego traer
  // emails por ids.
  let query = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("profiles" as any)
    .select(
      "id, username, display_name, created_at, banned_at, deleted_at, is_admin",
      { count: "exact" },
    );

  if (status === "active") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).is("banned_at", null).is("deleted_at", null);
  } else if (status === "banned") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).not("banned_at", "is", null);
  } else if (status === "deleted") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).not("deleted_at", "is", null);
  }
  if (q) {
    const term = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = (query as any).or(`username.ilike.${term},display_name.ilike.${term}`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles, count } = (await (query as any)
    .order("created_at", { ascending: false })
    .range(from, to)) as {
    data:
      | Array<{
          id: string;
          username: string;
          display_name: string | null;
          created_at: string;
          banned_at: string | null;
          deleted_at: string | null;
          is_admin: boolean;
        }>
      | null;
    count: number | null;
  };

  // Emails desde auth.users — sólo accesible con RLS de admin (via función rpc)
  // Para evitar dependencia extra creamos un select directo aprovechando que
  // el admin puede leer auth.users por SECURITY DEFINER del helper. Por simplicidad
  // creamos un RPC: get_admin_user_emails(ids uuid[]) → table(id, email).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: emails } = (await (supabase as any).rpc("get_admin_user_emails", {
    p_ids: (profiles ?? []).map((p) => p.id),
  })) as { data: Array<{ id: string; email: string | null }> | null };
  const emailMap = new Map((emails ?? []).map((e) => [e.id, e.email]));

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    email: emailMap.get(p.id) ?? null,
    created_at: p.created_at,
    deleted_at: p.deleted_at,
    is_admin: p.is_admin,
    status: p.deleted_at ? "deleted" : p.banned_at ? "banned" : "active",
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Usuarios
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} usuarios coinciden con los filtros.
        </p>
      </header>

      <UsersTable
        rows={rows}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
```

- [ ] **Step 6: Crear el RPC `get_admin_user_emails` (migración 0050)**

Archivo: `supabase/migrations/0050_admin_user_emails_rpc.sql`

```sql
-- Devuelve el email de auth.users para una lista de IDs.
-- Solo accesible para admins (valida internamente).
create or replace function public.get_admin_user_emails(p_ids uuid[])
returns table(id uuid, email text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'NOT_ADMIN';
  end if;
  return query
    select u.id, u.email::text
      from auth.users u
     where u.id = any(p_ids);
end;
$$;

grant execute on function public.get_admin_user_emails(uuid[]) to authenticated;
```

Crear `test/apply-0050.ts` (mismo skeleton) y aplicar.

- [ ] **Step 7: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke (`pnpm dev`):
- `/admin/usuarios` carga la tabla con los 30+ usuarios.
- Search funciona (buscar mi @username debe filtrar).
- Filtro de status cambia el listado.
- Click en `⋮` de un usuario test → menú aparece.
- Banear → dialog → confirmar → user pasa a banned (refresh muestra badge).
- Desbanear (mismo flujo) → vuelve a active.
- Soft-delete: dialog pide tipear `@username` exacto. Sin tipearlo, botón disabled. Tipeo correcto → procesa → user pasa a deleted, el @username queda liberado.
- Restaurar (el item aparece solo si está deleted_at < 30d) → user vuelve a active con su username original.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0050_admin_user_emails_rpc.sql test/apply-0050.ts src/app/\(admin\)/usuarios src/app/\(admin\)/_components/confirm-typing-dialog.tsx
git commit -m "$(cat <<'EOF'
feat(admin): gestión de usuarios — banear, soft-delete, restore

Tabla server-side con paginación 50/pág, search por username/display
y filtros de status. Action menu por row con dialogs:
- Banear/desbanear con razón opcional → cancela sus trades activos.
- Soft-delete pide tipear @username exacto para confirmar.
- Restore solo aparece si deleted_at < 30 días.

RPC get_admin_user_emails para enriquecer la lista con el email de
auth.users (solo accesible a admins).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 8: Página `/admin/intercambios` con cancelación manual

**Files:**
- Create: `src/app/(admin)/intercambios/page.tsx`
- Create: `src/app/(admin)/intercambios/actions.ts`
- Create: `src/app/(admin)/intercambios/_components/trades-table.tsx`

- [ ] **Step 1: Server action**

Archivo: `src/app/(admin)/intercambios/actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelTradeAdmin(input: { trade_id: string; reason: string | null }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_cancel_trade", {
    p_trade_id: input.trade_id,
    p_reason: input.reason,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/intercambios");
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin");
  return { success: true };
}
```

- [ ] **Step 2: Tabla cliente con dialog de cancel**

Archivo: `src/app/(admin)/intercambios/_components/trades-table.tsx`

```tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui-components/react/dialog";
import { ArrowRight, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelTradeAdmin } from "../actions";

export type AdminTradeRow = {
  id: string;
  from_username: string;
  to_username: string;
  status: string;
  trade_type: "swap" | "gift" | "sale" | null;
  price_cents: number | null;
  items_count: number;
  created_at: string;
};

const STATUS_CLS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-muted text-muted-foreground",
  rejected: "bg-[var(--panini-red)]/10 text-[var(--panini-red)]",
};

export function TradesTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminTradeRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState(sp.get("status") ?? "");
  const [typeFilter, setTypeFilter] = React.useState(sp.get("type") ?? "");
  const [participant, setParticipant] = React.useState(sp.get("q") ?? "");

  const [cancelTarget, setCancelTarget] = React.useState<AdminTradeRow | null>(null);
  const [reason, setReason] = React.useState("");
  const [pending, startTransition] = useTransition();

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");
    if (typeFilter) params.set("type", typeFilter);
    else params.delete("type");
    if (participant.trim()) params.set("q", participant.trim());
    else params.delete("q");
    params.set("page", "1");
    router.push(`/admin/intercambios?${params.toString()}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/intercambios?${params.toString()}`);
  }

  function doCancel() {
    if (!cancelTarget) return;
    startTransition(async () => {
      const res = await cancelTradeAdmin({
        trade_id: cancelTarget.id,
        reason: reason.trim() || null,
      });
      if (res?.error) toast.error(res.error);
      else toast.success("Trade cancelado");
      setCancelTarget(null);
      setReason("");
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todos los status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todos los tipos</option>
          <option value="swap">Swap</option>
          <option value="gift">Gift</option>
          <option value="sale">Sale</option>
        </select>
        <input
          type="search"
          value={participant}
          onChange={(e) => setParticipant(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="@username de participante"
          className="h-10 rounded-md border bg-card px-3 text-sm flex-1 min-w-[200px]"
        />
        <button
          type="button"
          onClick={applyFilters}
          className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium"
        >
          Aplicar
        </button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Trade</th>
              <th className="px-3 py-2 font-medium">Participantes</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium tabular">Items</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium tabular">Fecha</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/trades/${r.id}`} target="_blank" className="hover:underline">
                    {r.id.slice(0, 8)} <ExternalLink className="size-3 inline" />
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className="font-mono">@{r.from_username}</span>
                  <ArrowRight className="size-3 inline mx-1 text-muted-foreground" />
                  <span className="font-mono">@{r.to_username}</span>
                </td>
                <td className="px-3 py-2 text-xs uppercase tracking-wider">
                  {r.trade_type ?? "swap"}
                  {r.price_cents != null && (
                    <span className="ml-1 text-emerald-600 font-mono">
                      ${(r.price_cents / 100).toLocaleString("es-CO")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono tabular">{r.items_count}</td>
                <td className="px-3 py-2">
                  <Badge className={STATUS_CLS[r.status] ?? ""} variant="outline">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2 text-right">
                  {(r.status === "pending" || r.status === "accepted") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[var(--panini-red)]"
                      onClick={() => setCancelTarget(r)}
                    >
                      <X className="size-3.5 mr-1" /> Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalCount.toLocaleString("es-CO")} resultados · página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Anterior
            </button>
            <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Dialog de cancel */}
      <Dialog.Root open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <Dialog.Title className="font-display text-xl font-semibold">
              Cancelar trade
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              Cancelará el intercambio entre <span className="font-mono">@{cancelTarget?.from_username}</span> y <span className="font-mono">@{cancelTarget?.to_username}</span>. Ambos reciben notificación.
            </Dialog.Description>
            <div className="space-y-1.5">
              <label className="eyebrow block">Razón (opcional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelTarget(null)}>
                No, cerrar
              </Button>
              <Button variant="destructive" disabled={pending} onClick={doCancel}>
                {pending ? "Cancelando…" : "Sí, cancelar trade"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
```

- [ ] **Step 3: Página server**

Archivo: `src/app/(admin)/intercambios/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { TradesTable, type AdminTradeRow } from "./_components/trades-table";

const PAGE_SIZE = 50;

export default async function AdminTradesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string }>;
}) {
  const { status, type, q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  // Construir query. Filtro por participante requiere join porque
  // tenemos username en profiles. Hacemos: si q presente, primero
  // resolvemos los user_ids de username que matchea.
  let participantIds: string[] | null = null;
  if (q) {
    const term = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ps } = await (supabase as any)
      .from("profiles")
      .select("id")
      .ilike("username", term)
      .limit(200);
    participantIds = ((ps ?? []) as Array<{ id: string }>).map((p) => p.id);
    if (participantIds.length === 0) participantIds = ["00000000-0000-0000-0000-000000000000"];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("trades")
    .select(
      "id, from_user, to_user, status, trade_type, price_cents, created_at, trade_items(id)",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  if (type) query = query.eq("trade_type", type);
  if (participantIds) {
    const idList = participantIds.map((i) => `"${i}"`).join(",");
    query = query.or(`from_user.in.(${idList}),to_user.in.(${idList})`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: trades, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const userIds = new Set<string>();
  for (const t of (trades ?? []) as Array<{ from_user: string; to_user: string }>) {
    userIds.add(t.from_user);
    userIds.add(t.to_user);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, username")
    .in("id", [...userIds]);
  const usernameById = new Map(
    ((profiles ?? []) as Array<{ id: string; username: string }>).map((p) => [p.id, p.username]),
  );

  const rows: AdminTradeRow[] = ((trades ?? []) as Array<{
    id: string;
    from_user: string;
    to_user: string;
    status: string;
    trade_type: "swap" | "gift" | "sale" | null;
    price_cents: number | null;
    created_at: string;
    trade_items: Array<{ id: string }>;
  }>).map((t) => ({
    id: t.id,
    from_username: usernameById.get(t.from_user) ?? "?",
    to_username: usernameById.get(t.to_user) ?? "?",
    status: t.status,
    trade_type: t.trade_type,
    price_cents: t.price_cents,
    items_count: t.trade_items?.length ?? 0,
    created_at: t.created_at,
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Intercambios
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} trades coinciden con los filtros.
        </p>
      </header>

      <TradesTable rows={rows} totalCount={count ?? 0} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
```

- [ ] **Step 4: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke:
- `/admin/intercambios` lista trades existentes.
- Filtrar por status pending → solo pending.
- Filtrar por @username (uno que tenga trades) → solo sus trades.
- Cancelar un trade pending de prueba → dialog → confirmar → trade pasa a cancelled, ambos participantes reciben notif `trade_cancelled_admin`.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/intercambios
git commit -m "$(cat <<'EOF'
feat(admin): listado global de intercambios + cancelación manual

Filtros: status, type, participante (busca por @username con join).
Cancelación abre dialog con razón opcional. RPC admin_cancel_trade
notifica a ambos con trade_cancelled_admin.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 9: Página `/admin/albums` (toggle active + edit metadata)

**Files:**
- Create: `src/app/(admin)/albums/page.tsx`
- Create: `src/app/(admin)/albums/actions.ts`
- Create: `src/app/(admin)/albums/_components/albums-list.tsx`

- [ ] **Step 1: Server actions**

Archivo: `src/app/(admin)/albums/actions.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function bump() {
  revalidatePath("/admin/albums");
  revalidatePath("/admin/auditoria");
}

export async function setAlbumActive(input: { album_id: string; active: boolean }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_set_album_active", {
    p_album_id: input.album_id,
    p_active: input.active,
  });
  if (error) return { error: error.message };
  bump();
  return { success: true };
}

const metaSchema = z.object({
  album_id: z.string().uuid(),
  name: z.string().min(1).max(120).optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
});

export async function updateAlbumMeta(input: z.infer<typeof metaSchema>) {
  const parsed = metaSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_update_album_meta", {
    p_album_id: parsed.data.album_id,
    p_name: parsed.data.name ?? null,
    p_year: parsed.data.year ?? null,
  });
  if (error) return { error: error.message };
  bump();
  return { success: true };
}
```

- [ ] **Step 2: Lista cliente con switch + edit inline**

Archivo: `src/app/(admin)/albums/_components/albums-list.tsx`

```tsx
"use client";

import * as React from "react";
import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setAlbumActive, updateAlbumMeta } from "../actions";

export type AdminAlbumRow = {
  id: string;
  code: string;
  name: string;
  year: number | null;
  total_stickers: number;
  is_active: boolean;
  created_at: string;
};

export function AlbumsList({ albums }: { albums: AdminAlbumRow[] }) {
  return (
    <div className="space-y-2">
      {albums.map((a) => (
        <AlbumRow key={a.id} album={a} />
      ))}
    </div>
  );
}

function AlbumRow({ album }: { album: AdminAlbumRow }) {
  const [pending, startTransition] = useTransition();
  const [editingName, setEditingName] = React.useState(false);
  const [name, setName] = React.useState(album.name);
  const [editingYear, setEditingYear] = React.useState(false);
  const [year, setYear] = React.useState(String(album.year ?? ""));

  function toggleActive(next: boolean) {
    if (next && !album.is_active) {
      if (!confirm(`¿Cambiar el álbum activo a "${album.name}"? Esto afecta a todos los usuarios.`)) return;
    }
    startTransition(async () => {
      const res = await setAlbumActive({ album_id: album.id, active: next });
      if (res?.error) toast.error(res.error);
      else toast.success(next ? "Álbum activado" : "Álbum desactivado");
    });
  }

  function saveName() {
    if (name.trim() === album.name) {
      setEditingName(false);
      return;
    }
    startTransition(async () => {
      const res = await updateAlbumMeta({ album_id: album.id, name: name.trim() });
      if (res?.error) toast.error(res.error);
      else toast.success("Nombre actualizado");
      setEditingName(false);
    });
  }

  function saveYear() {
    const n = Number(year);
    if (!n || n === album.year) {
      setEditingYear(false);
      return;
    }
    startTransition(async () => {
      const res = await updateAlbumMeta({ album_id: album.id, year: n });
      if (res?.error) toast.error(res.error);
      else toast.success("Año actualizado");
      setEditingYear(false);
    });
  }

  return (
    <div className="border rounded-xl bg-card p-5 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px] space-y-1">
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
            />
            <button type="button" onClick={saveName} className="size-7 rounded-md border bg-card grid place-items-center hover:bg-muted">
              <Check className="size-3.5" />
            </button>
            <button type="button" onClick={() => { setEditingName(false); setName(album.name); }} className="size-7 rounded-md border bg-card grid place-items-center hover:bg-muted">
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingName(true)} className="text-left">
            <h2 className="font-display text-lg font-semibold tracking-tight hover:underline">
              {album.name}
            </h2>
          </button>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{album.code}</span>
          {editingYear ? (
            <div className="inline-flex items-center gap-1">
              <input
                autoFocus
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
              />
              <button type="button" onClick={saveYear} className="size-6 rounded-md border bg-card grid place-items-center hover:bg-muted">
                <Check className="size-3" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingYear(true)} className="hover:underline">
              {album.year ?? "—"}
            </button>
          )}
          <span>·</span>
          <span>{album.total_stickers} cromos</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Activo</span>
        <Switch
          checked={album.is_active}
          onCheckedChange={toggleActive}
          disabled={pending}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Página server**

Archivo: `src/app/(admin)/albums/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { AlbumsList, type AdminAlbumRow } from "./_components/albums-list";

export default async function AdminAlbumsPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: albums } = (await (supabase as any)
    .from("albums")
    .select("id, code, name, year, total_stickers, is_active, created_at")
    .order("year", { ascending: false })) as {
    data: AdminAlbumRow[] | null;
  };

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Álbumes
        </h1>
        <p className="text-sm text-muted-foreground">
          Solo un álbum puede estar activo a la vez. El activo es el que ve la app.
        </p>
      </header>
      <AlbumsList albums={albums ?? []} />
    </div>
  );
}
```

- [ ] **Step 4: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke:
- `/admin/albums` lista los álbumes existentes (FWC2026 activo).
- Click en el nombre → input edita → enter/check guarda.
- Click en el año → mismo.
- Switch activo: si lo desactivás te confirma. Si lo activás en uno distinto, abre confirm.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/albums
git commit -m "$(cat <<'EOF'
feat(admin): gestión de álbumes (toggle activo + edit metadata)

Lista todos los álbumes con switch de activación (mutuamente
exclusivo entre los álbumes) y edit inline de nombre y año. Confirm
al cambiar el activo porque afecta a todos los usuarios.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 10: Página `/admin/auditoria` (read-only)

**Files:**
- Create: `src/app/(admin)/auditoria/page.tsx`
- Create: `src/app/(admin)/auditoria/_components/audit-table.tsx`

- [ ] **Step 1: Tabla cliente con filtros**

Archivo: `src/app/(admin)/auditoria/_components/audit-table.tsx`

```tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export type AdminAuditRow = {
  id: string;
  actor_username: string | null;
  action: string;
  target_kind: string;
  target_id: string | null;
  meta: unknown;
  created_at: string;
};

const ACTION_LABEL: Record<string, string> = {
  ban_user: "Banear",
  unban_user: "Desbanear",
  soft_delete_user: "Borrar usuario",
  restore_user: "Restaurar usuario",
  cancel_trade: "Cancelar trade",
  set_album_active: "Toggle álbum activo",
  update_album_meta: "Editar álbum",
  auto_purge_deleted: "Cron purge",
};

export function AuditTable({
  rows,
  totalCount,
  page,
  pageSize,
}: {
  rows: AdminAuditRow[];
  totalCount: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [actor, setActor] = React.useState(sp.get("actor") ?? "");
  const [action, setAction] = React.useState(sp.get("action") ?? "");

  function applyFilters() {
    const params = new URLSearchParams(sp.toString());
    if (actor.trim()) params.set("actor", actor.trim());
    else params.delete("actor");
    if (action) params.set("action", action);
    else params.delete("action");
    params.set("page", "1");
    router.push(`/admin/auditoria?${params.toString()}`);
  }

  function goPage(p: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`/admin/auditoria?${params.toString()}`);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="actor @username"
          className="h-10 rounded-md border bg-card px-3 text-sm flex-1 min-w-[200px]"
        />
        <select value={action} onChange={(e) => setAction(e.target.value)} className="h-10 rounded-md border bg-card px-3 text-sm">
          <option value="">Todas las acciones</option>
          {Object.entries(ACTION_LABEL).map(([v, lbl]) => (
            <option key={v} value={v}>
              {lbl}
            </option>
          ))}
        </select>
        <button type="button" onClick={applyFilters} className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium">
          Aplicar
        </button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium tabular">Cuándo</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Acción</th>
              <th className="px-3 py-2 font-medium">Target</th>
              <th className="px-3 py-2 font-medium">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs tabular">
                  {new Date(r.created_at).toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Bogota",
                  })}
                </td>
                <td className="px-3 py-2 text-xs">
                  {r.actor_username ? `@${r.actor_username}` : <span className="text-muted-foreground italic">sistema</span>}
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {ACTION_LABEL[r.action] ?? r.action}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs font-mono text-muted-foreground">
                  {r.target_kind} · {r.target_id?.slice(0, 8) ?? "—"}
                </td>
                <td className="px-3 py-2">
                  <details>
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                      Ver
                    </summary>
                    <pre className="text-[10px] font-mono whitespace-pre-wrap mt-1 max-w-md overflow-auto">
                      {JSON.stringify(r.meta, null, 2)}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalCount.toLocaleString("es-CO")} resultados · página {page} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => goPage(page - 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Anterior
            </button>
            <button disabled={page >= totalPages} onClick={() => goPage(page + 1)} className="h-8 px-3 rounded-md border bg-card disabled:opacity-40">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Página server**

Archivo: `src/app/(admin)/auditoria/page.tsx`

```tsx
import { createClient } from "@/lib/supabase/server";
import { AuditTable, type AdminAuditRow } from "./_components/audit-table";

const PAGE_SIZE = 50;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; action?: string; page?: string }>;
}) {
  const { actor, action, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const supabase = await createClient();

  let actorIds: string[] | null = null;
  if (actor) {
    const term = `%${actor.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ps } = await (supabase as any)
      .from("profiles")
      .select("id")
      .ilike("username", term)
      .limit(200);
    actorIds = ((ps ?? []) as Array<{ id: string }>).map((p) => p.id);
    if (actorIds.length === 0) actorIds = ["00000000-0000-0000-0000-000000000000"];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("admin_actions")
    .select("id, actor_id, action, target_kind, target_id, meta, created_at", {
      count: "exact",
    });

  if (action) query = query.eq("action", action);
  if (actorIds) query = query.in("actor_id", actorIds);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const { data: actions, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const actorIdSet = new Set<string>();
  for (const a of (actions ?? []) as Array<{ actor_id: string | null }>) {
    if (a.actor_id) actorIdSet.add(a.actor_id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles } = await (supabase as any)
    .from("profiles")
    .select("id, username")
    .in("id", [...actorIdSet]);
  const usernameById = new Map(
    ((profiles ?? []) as Array<{ id: string; username: string }>).map((p) => [p.id, p.username]),
  );

  const rows: AdminAuditRow[] = ((actions ?? []) as Array<{
    id: string;
    actor_id: string | null;
    action: string;
    target_kind: string;
    target_id: string | null;
    meta: unknown;
    created_at: string;
  }>).map((a) => ({
    id: a.id,
    actor_username: a.actor_id ? usernameById.get(a.actor_id) ?? null : null,
    action: a.action,
    target_kind: a.target_kind,
    target_id: a.target_id,
    meta: a.meta,
    created_at: a.created_at,
  }));

  return (
    <div className="space-y-6">
      <header>
        <span className="eyebrow">Panel admin</span>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Auditoría
        </h1>
        <p className="text-sm text-muted-foreground">
          {(count ?? 0).toLocaleString("es-CO")} acciones registradas (read-only).
        </p>
      </header>

      <AuditTable rows={rows} totalCount={count ?? 0} page={page} pageSize={PAGE_SIZE} />
    </div>
  );
}
```

- [ ] **Step 3: Verificar TS + smoke**

Run: `npx tsc --noEmit 2>&1 | grep -E "^(src|app|components)/" | head`
Expected: vacío.

Smoke:
- `/admin/auditoria` lista todas las acciones realizadas (debería haber varias de los tests previos: bans, restores, cancels, album toggles).
- Filtros por actor y por action funcionan.
- "Ver" expande el meta JSON.

- [ ] **Step 4: Commit final**

```bash
git add src/app/\(admin\)/auditoria
git commit -m "$(cat <<'EOF'
feat(admin): página de auditoría read-only

Lista todas las acciones admin con filtros por actor (@username) y
acción. Muestra meta JSON expandible. Las filas no son editables —
el log es inmutable.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
git push
```

---

## Validation final

Después de completar todas las tareas, hacer una pasada final:

- [ ] **End-to-end smoke test:** entrar como admin, recorrer cada página del panel, hacer una acción de cada tipo (ban a un test user, soft-delete + restore, cancelar un trade, toggle album, ver que todo aparezca en auditoría).
- [ ] **Verificar que como no-admin todas las rutas devuelvan 404.**
- [ ] **Verificar `pnpm build` pasa**: `pnpm build 2>&1 | tail -30`. Si hay warnings nuevos, revisar.
- [ ] **Push final** (si no hubo en cada tarea).
