drop policy if exists reservation_bids_update_owner_or_rider on public.reservation_bids;
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
    )
  );
