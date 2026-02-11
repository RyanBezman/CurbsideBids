create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('ride', 'package', 'scheduled')),
  status text not null default 'requested' check (status in ('requested')),
  pickup_label text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  dropoff_label text not null,
  dropoff_lat double precision,
  dropoff_lng double precision,
  ride_type text not null,
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists reservations_user_id_idx
  on public.reservations (user_id);

create index if not exists reservations_scheduled_at_idx
  on public.reservations (scheduled_at);

alter table public.reservations enable row level security;

drop policy if exists reservations_select_own on public.reservations;
create policy reservations_select_own
  on public.reservations
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists reservations_insert_own on public.reservations;
create policy reservations_insert_own
  on public.reservations
  for insert
  to authenticated
  with check (auth.uid() = user_id);
