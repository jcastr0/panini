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
