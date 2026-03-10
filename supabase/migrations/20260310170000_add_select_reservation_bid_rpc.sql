create or replace function public.select_reservation_bid(
  input_reservation_id uuid,
  input_bid_id uuid
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  target_reservation public.reservations%rowtype;
  chosen_bid public.reservation_bids%rowtype;
  updated_reservation public.reservations%rowtype;
begin
  select *
  into target_reservation
  from public.reservations
  where id = input_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found.';
  end if;

  if target_reservation.user_id <> auth.uid() then
    raise exception 'You do not have access to select a bid for this reservation.';
  end if;

  if target_reservation.status <> 'pending' then
    raise exception 'Reservation is no longer open for bid selection.';
  end if;

  select *
  into chosen_bid
  from public.reservation_bids
  where id = input_bid_id
    and reservation_id = input_reservation_id
  for update;

  if not found then
    raise exception 'Bid not found for this reservation.';
  end if;

  if chosen_bid.status <> 'active' then
    raise exception 'This bid is no longer available.';
  end if;

  update public.reservation_bids
  set status = 'rejected'
  where reservation_id = input_reservation_id
    and id <> input_bid_id
    and status = 'active';

  update public.reservation_bids
  set status = 'selected'
  where id = input_bid_id;

  update public.reservations
  set
    selected_bid_id = input_bid_id,
    driver_id = chosen_bid.driver_id,
    agreed_fare_cents = chosen_bid.amount_cents,
    status = 'bid_selected'
  where id = input_reservation_id
  returning *
  into updated_reservation;

  return updated_reservation;
end;
$$;

revoke all on function public.select_reservation_bid(uuid, uuid) from public;
grant execute on function public.select_reservation_bid(uuid, uuid) to authenticated;
