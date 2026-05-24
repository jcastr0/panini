-- Panini Trading Platform — schema inicial
-- Aplicar en orden: 0001_init.sql, 0002_rls.sql, 0003_matching.sql, 0004_seed_album_2026.sql

create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
  create type sticker_type as enum ('normal', 'shiny', 'legend', 'special');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trade_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trade_direction as enum ('offer', 'request');
exception when duplicate_object then null; end $$;

-- Catálogo de álbumes
create table if not exists public.albums (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  edition_year int not null,
  total_stickers int not null default 0,
  cover_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Cromos del álbum
create table if not exists public.stickers (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid not null references public.albums(id) on delete cascade,
  number int not null,
  name text not null,
  team text,
  group_code text,
  type sticker_type not null default 'normal',
  rarity int not null default 1,
  image_url text,
  unique (album_id, number)
);
create index if not exists stickers_album_idx on public.stickers(album_id);
create index if not exists stickers_team_idx on public.stickers(team);

-- Perfil ligado a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  display_name text,
  city text,
  country text,
  avatar_url text,
  is_public_profile boolean not null default true,
  created_at timestamptz not null default now()
);

-- Inventario de cromos del usuario (cantidad por cromo)
create table if not exists public.user_stickers (
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, sticker_id)
);
create index if not exists user_stickers_user_idx on public.user_stickers(user_id);
create index if not exists user_stickers_sticker_idx on public.user_stickers(sticker_id);

-- Propuestas de intercambio
create table if not exists public.trades (
  id uuid primary key default uuid_generate_v4(),
  from_user uuid not null references auth.users(id) on delete cascade,
  to_user uuid not null references auth.users(id) on delete cascade,
  status trade_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create index if not exists trades_from_idx on public.trades(from_user);
create index if not exists trades_to_idx on public.trades(to_user);

create table if not exists public.trade_items (
  id uuid primary key default uuid_generate_v4(),
  trade_id uuid not null references public.trades(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  direction trade_direction not null,
  quantity int not null check (quantity > 0)
);
create index if not exists trade_items_trade_idx on public.trade_items(trade_id);

-- Trigger para auto-crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  candidate text;
  attempts int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username',
             split_part(new.email, '@', 1),
             'user'),
    '[^a-z0-9_]', '', 'g'
  ));
  if char_length(base_username) < 3 then
    base_username := base_username || 'usr';
  end if;
  base_username := substring(base_username from 1 for 28);
  candidate := base_username;

  while exists (select 1 from public.profiles where username = candidate) and attempts < 5 loop
    candidate := base_username || substr(md5(random()::text), 1, 4);
    attempts := attempts + 1;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger updated_at en trades
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_trades on public.trades;
create trigger touch_trades
  before update on public.trades
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_user_stickers on public.user_stickers;
create trigger touch_user_stickers
  before update on public.user_stickers
  for each row execute function public.touch_updated_at();
