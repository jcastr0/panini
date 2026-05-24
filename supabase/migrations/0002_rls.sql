-- Row Level Security

alter table public.albums         enable row level security;
alter table public.stickers       enable row level security;
alter table public.profiles       enable row level security;
alter table public.user_stickers  enable row level security;
alter table public.trades         enable row level security;
alter table public.trade_items    enable row level security;

-- ALBUMS: lectura pública, escritura solo service role (catálogo no editable por usuarios)
drop policy if exists albums_select on public.albums;
create policy albums_select on public.albums
  for select using (true);

-- STICKERS: lectura pública
drop policy if exists stickers_select on public.stickers;
create policy stickers_select on public.stickers
  for select using (true);

-- PROFILES
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles
  for select using (is_public_profile = true or auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- USER_STICKERS
drop policy if exists user_stickers_select on public.user_stickers;
create policy user_stickers_select on public.user_stickers
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles p
      where p.id = user_stickers.user_id and p.is_public_profile = true
    )
  );

drop policy if exists user_stickers_insert_self on public.user_stickers;
create policy user_stickers_insert_self on public.user_stickers
  for insert with check (auth.uid() = user_id);

drop policy if exists user_stickers_update_self on public.user_stickers;
create policy user_stickers_update_self on public.user_stickers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_stickers_delete_self on public.user_stickers;
create policy user_stickers_delete_self on public.user_stickers
  for delete using (auth.uid() = user_id);

-- TRADES: solo participantes leen/escriben
drop policy if exists trades_select_participants on public.trades;
create policy trades_select_participants on public.trades
  for select using (auth.uid() in (from_user, to_user));

drop policy if exists trades_insert_from_self on public.trades;
create policy trades_insert_from_self on public.trades
  for insert with check (auth.uid() = from_user);

drop policy if exists trades_update_participants on public.trades;
create policy trades_update_participants on public.trades
  for update using (auth.uid() in (from_user, to_user))
              with check (auth.uid() in (from_user, to_user));

-- TRADE_ITEMS: heredan permisos del trade padre
drop policy if exists trade_items_select on public.trade_items;
create policy trade_items_select on public.trade_items
  for select using (
    exists (
      select 1 from public.trades t
      where t.id = trade_items.trade_id
        and auth.uid() in (t.from_user, t.to_user)
    )
  );

drop policy if exists trade_items_insert on public.trade_items;
create policy trade_items_insert on public.trade_items
  for insert with check (
    exists (
      select 1 from public.trades t
      where t.id = trade_items.trade_id
        and auth.uid() = t.from_user
        and t.status = 'pending'
    )
  );
