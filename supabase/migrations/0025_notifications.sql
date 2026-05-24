-- Notificaciones in-app para eventos de trading.
-- Las inserciones las hacen las funciones accept_trade/complete_trade (0026/0027)
-- y un trigger sobre insert into trades (propuesta nueva → notif al receptor).

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in (
    'trade_received',    -- llega propuesta entrante
    'trade_accepted',    -- mi propuesta fue aceptada
    'trade_rejected',    -- mi propuesta fue rechazada
    'trade_completed',   -- el intercambio se marcó completado
    'trade_superseded',  -- mi propuesta cayó porque el cromo ya se intercambió
    'trade_cancelled'    -- el proponente canceló
  )),
  trade_id uuid references public.trades(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc)
  where read_at is null;

create index if not exists notifications_user_all_idx
  on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists notifications_delete_self on public.notifications;
create policy notifications_delete_self on public.notifications
  for delete using (auth.uid() = user_id);

-- Trigger: al crear un trade nuevo (status='pending') notificamos al receptor.
create or replace function public.notify_trade_received()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' then
    insert into public.notifications(user_id, kind, trade_id)
    values (new.to_user, 'trade_received', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_trade_created on public.trades;
create trigger on_trade_created
  after insert on public.trades
  for each row execute function public.notify_trade_received();
