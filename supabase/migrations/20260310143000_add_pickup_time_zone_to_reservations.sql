alter table public.reservations
  add column if not exists pickup_time_zone text;
