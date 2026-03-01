create table if not exists public.reservation_bids (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  driver_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  eta_minutes integer check (eta_minutes is null or eta_minutes > 0),
  note text,
  status text not null default 'active' check (status in ('active', 'selected', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reservation_bids_reservation_driver_unique_idx
  on public.reservation_bids (reservation_id, driver_id);

create unique index if not exists reservation_bids_selected_unique_idx
  on public.reservation_bids (reservation_id)
  where status = 'selected';

create index if not exists reservation_bids_driver_created_at_idx
  on public.reservation_bids (driver_id, created_at desc);

create index if not exists reservation_bids_reservation_created_at_idx
  on public.reservation_bids (reservation_id, created_at desc);

create or replace function public.set_reservation_bids_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservation_bids_set_updated_at on public.reservation_bids;
create trigger reservation_bids_set_updated_at
before update on public.reservation_bids
for each row
execute function public.set_reservation_bids_updated_at();

alter table public.reservation_bids enable row level security;

drop policy if exists reservation_bids_select_visible on public.reservation_bids;
create policy reservation_bids_select_visible
  on public.reservation_bids
  for select
  to authenticated
  using (
    driver_id = auth.uid()
    or exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists reservation_bids_insert_driver on public.reservation_bids;
create policy reservation_bids_insert_driver
  on public.reservation_bids
  for insert
  to authenticated
  with check (
    driver_id = auth.uid()
    and (auth.jwt() -> 'user_metadata' ->> 'role') = 'driver'
    and exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.status = 'pending'
        and r.kind in ('ride', 'scheduled')
        and r.user_id <> auth.uid()
    )
  );

drop policy if exists reservation_bids_update_owner_or_rider on public.reservation_bids;
create policy reservation_bids_update_owner_or_rider
  on public.reservation_bids
  for update
  to authenticated
  using (
    (
      driver_id = auth.uid()
      and status in ('active', 'withdrawn')
    )
    or (
      exists (
        select 1
        from public.reservations r
        where r.id = reservation_id
          and r.user_id = auth.uid()
      )
    )
  )
  with check (
    (
      driver_id = auth.uid()
      and status in ('active', 'withdrawn')
    )
    or exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists reservation_bids_delete_owner on public.reservation_bids;
create policy reservation_bids_delete_owner
  on public.reservation_bids
  for delete
  to authenticated
  using (driver_id = auth.uid());

alter table public.reservations
  add column if not exists driver_id uuid references auth.users(id) on delete set null,
  add column if not exists selected_bid_id uuid references public.reservation_bids(id) on delete set null,
  add column if not exists agreed_fare_cents integer;

alter table public.reservations
  drop constraint if exists reservations_agreed_fare_cents_check;

alter table public.reservations
  add constraint reservations_agreed_fare_cents_check
  check (agreed_fare_cents is null or agreed_fare_cents > 0);

alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  add constraint reservations_status_check
  check (
    status in (
      'pending',
      'bid_selected',
      'accepted',
      'driver_en_route',
      'picked_up',
      'completed',
      'canceled'
    )
  );
