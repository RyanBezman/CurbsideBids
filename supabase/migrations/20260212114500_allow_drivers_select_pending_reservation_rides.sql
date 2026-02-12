drop policy if exists reservations_select_own on public.reservations;

create policy reservations_select_own
  on public.reservations
  for select
  to authenticated
  using (
    auth.uid() = user_id
    or (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'driver'
      and status = 'pending'
      and kind in ('ride', 'scheduled')
    )
  );
