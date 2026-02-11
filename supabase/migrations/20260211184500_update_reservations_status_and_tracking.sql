alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  alter column status set default 'pending';

update public.reservations
set status = 'pending'
where status = 'requested';

alter table public.reservations
  add constraint reservations_status_check
  check (status in ('pending', 'accepted', 'canceled'));

alter table public.reservations
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists canceled_at timestamptz;

create or replace function public.set_reservations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_reservations_updated_at();

drop policy if exists reservations_update_own on public.reservations;
create policy reservations_update_own
  on public.reservations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
