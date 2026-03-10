alter table public.reservations
  add column if not exists max_fare_cents integer;

alter table public.reservations
  drop constraint if exists reservations_max_fare_cents_check;

alter table public.reservations
  add constraint reservations_max_fare_cents_check
  check (max_fare_cents is null or max_fare_cents > 0);

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
        and amount_cents <= coalesce(r.max_fare_cents, 2147483647)
    )
  );

drop policy if exists reservation_bids_update_driver_pending on public.reservation_bids;
create policy reservation_bids_update_driver_pending
  on public.reservation_bids
  for update
  to authenticated
  using (
    driver_id = auth.uid()
    and status in ('active', 'withdrawn')
    and exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.status = 'pending'
        and r.kind in ('ride', 'scheduled')
        and r.user_id <> auth.uid()
        and amount_cents <= coalesce(r.max_fare_cents, 2147483647)
    )
  )
  with check (
    driver_id = auth.uid()
    and status in ('active', 'withdrawn')
    and exists (
      select 1
      from public.reservations r
      where r.id = reservation_id
        and r.status = 'pending'
        and r.kind in ('ride', 'scheduled')
        and r.user_id <> auth.uid()
        and amount_cents <= coalesce(r.max_fare_cents, 2147483647)
    )
  );
