drop policy if exists reservations_update_own on public.reservations;
drop policy if exists reservations_update_driver_cancel on public.reservations;

create policy reservations_update_own
  on public.reservations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy reservations_update_driver_cancel
  on public.reservations
  for update
  to authenticated
  using (
    auth.uid() = driver_id
    and status in ('bid_selected', 'accepted')
  )
  with check (
    auth.uid() = driver_id
    and status = 'canceled'
    and canceled_at is not null
  );
