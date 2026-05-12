-- Laeufer Randomizer — Supabase schema
-- Run this in the Supabase SQL Editor after creating a new project.
-- Re-runnable: drops + recreates everything cleanly.

-- =====================
-- DROP (clean re-runs)
-- =====================
drop trigger if exists rosters_updated_at on public.rosters;
drop trigger if exists settings_updated_at on public.settings;
drop function if exists public.set_updated_at();
drop table if exists public.rosters;
drop table if exists public.settings;
drop table if exists public.profiles;

-- =====================
-- TABLES
-- =====================

-- profiles: 1:1 with auth.users (room for future display name etc.)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- settings: 1:1 per user. Stores ALL user state (pool + assignments + settings).
-- Per-record updated_at is THIS row's timestamp.
create table public.settings (
  user_id uuid primary key references auth.users on delete cascade,
  mode text not null default 'positions' check (mode in ('positions','simple')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  lang text not null default 'de' check (lang in ('de','en')),
  team_size int not null default 6 check (team_size between 1 and 12),
  team1_no_libero boolean not null default false,
  team2_no_libero boolean not null default false,
  pool jsonb not null default '[]'::jsonb,
  assignments jsonb not null default '{}'::jsonb,
  simple_list jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- rosters: many per user. Per-record updated_at = per-roster timestamp (per D3).
create table public.rosters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index rosters_user_id_idx on public.rosters (user_id);

-- =====================
-- updated_at trigger
-- =====================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

create trigger rosters_updated_at
  before update on public.rosters
  for each row execute function public.set_updated_at();

-- =====================
-- Row-Level Security
-- =====================

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.rosters enable row level security;

-- profiles
create policy "users see own profile"
  on public.profiles for select
  using (auth.uid() = id);
create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- settings
create policy "users see own settings"
  on public.settings for select
  using (auth.uid() = user_id);
create policy "users insert own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);
create policy "users update own settings"
  on public.settings for update
  using (auth.uid() = user_id);

-- rosters
create policy "users see own rosters"
  on public.rosters for select
  using (auth.uid() = user_id);
create policy "users insert own rosters"
  on public.rosters for insert
  with check (auth.uid() = user_id);
create policy "users update own rosters"
  on public.rosters for update
  using (auth.uid() = user_id);
create policy "users delete own rosters"
  on public.rosters for delete
  using (auth.uid() = user_id);

-- =====================
-- Realtime publication (for live sync across devices)
-- =====================
-- These commands enable broadcasting INSERT/UPDATE/DELETE events to subscribed clients.
-- Supabase enables this by default for new projects, but be explicit.
alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.rosters;
