# Rider Bid Selection Flow

This document defines how concurrent driver bidding and rider bid selection work for reservation rides in `curbside-bids`.

## Purpose
- Allow multiple drivers to bid on the same rider reservation at the same time.
- Allow the rider to choose exactly one winning bid.
- Make winner selection race-safe and server-controlled.
- Keep rider, winning driver, and losing drivers in sync through reservation state changes.

## Core Model

### Reservations
- A reservation is the marketplace unit.
- The reservation remains open for bidding while `reservations.status = 'pending'`.
- Once a rider chooses a bid, the reservation stops being an open marketplace item.

Important reservation fields:
- `reservations.id`
- `reservations.status`
- `reservations.driver_id`
- `reservations.selected_bid_id`
- `reservations.agreed_fare_cents`
- `reservations.max_fare_cents`

### Reservation Bids
- `reservation_bids` stores driver offers for a reservation.
- Each driver may have at most one bid per reservation.
- Many different drivers may bid on the same reservation concurrently.
- At most one bid may be marked `selected` for a reservation.

Important bid fields:
- `reservation_bids.id`
- `reservation_bids.reservation_id`
- `reservation_bids.driver_id`
- `reservation_bids.amount_cents`
- `reservation_bids.eta_minutes`
- `reservation_bids.note`
- `reservation_bids.status`

## Concurrency Rules
- Multiple drivers bidding at once is expected and allowed.
- Concurrent bid placement is safe because of the unique constraint on `(reservation_id, driver_id)`.
- The only critical race is rider selection of a winning bid.
- Bid selection must never be implemented as a client-side sequence of independent updates.
- Winner selection must be a single atomic database operation.

## Required Database Guarantees
- One driver, one bid per reservation:
  - unique index on `(reservation_id, driver_id)`
- One selected bid per reservation:
  - partial unique index where `status = 'selected'`
- Drivers may only insert bids for reservations that are still open for bidding.
- Drivers may only insert or update bids at or below `reservations.max_fare_cents` when a rider budget is set.
- Once a reservation is no longer `pending`, it must no longer accept new bids or bid edits that would keep the auction active.

## Source of Truth
- `reservations` is the source of truth for assignment.
- The winning driver is determined from:
  - `reservations.selected_bid_id`
  - `reservations.driver_id`
  - `reservations.agreed_fare_cents`
- The app must not infer the winner only from `reservation_bids.status`.

## Bid Lifecycle

### Open Market
When a reservation is open:
- `reservations.status = 'pending'`
- zero or more related bids may exist
- bid rows are usually `active`
- rider pricing may include `reservations.max_fare_cents` as a hard bid ceiling

### Rider Budget
- Riders can set a maximum amount they are willing to pay before a reservation enters the bid marketplace.
- The rider-facing UI should present a fair route-based range and default the cap slightly above the shared baseline suggestion.
- Driver bids above the rider cap must be rejected both in app logic and by SQL policy.
- The pricing model must remain cents-based end to end. Do not store or compare currency as floating-point dollars.

### Selection
When the rider chooses a bid:
- exactly one bid becomes `selected`
- all competing active bids for that reservation become `rejected`
- the reservation is assigned to the winning driver
- the reservation leaves the open bidding market

### After Selection
After a winner is chosen:
- no additional driver bids should be accepted
- the rider must not be able to select a second winner
- losing drivers should no longer see that reservation in pending-driver queues
- the winning driver should transition into the assigned-trip flow

## Required Selection Mechanism

### Use an RPC / Stored Procedure
Bid selection is implemented as the Postgres function:
- `public.select_reservation_bid(input_reservation_id uuid, input_bid_id uuid)`

This function:
1. Lock the reservation row with `FOR UPDATE`.
2. Verify the caller owns the reservation.
3. Verify the reservation is still `pending`.
4. Verify the bid belongs to the reservation.
5. Verify the chosen bid is still `active`.
6. Mark the chosen bid as `selected`.
7. Mark competing active bids for the same reservation as `rejected`.
8. Update the reservation:
   - `selected_bid_id = chosen bid id`
   - `driver_id = chosen bid driver_id`
   - `agreed_fare_cents = chosen bid amount_cents`
   - `status = 'bid_selected'` or the next agreed assignment status
9. Return the updated reservation row.

### Why RPC Is Required
Without an RPC, the client could:
- read stale bids
- attempt overlapping updates
- select a winner after another user action already changed the reservation
- leave reservation and bid tables out of sync if one update succeeds and another fails

The database must arbitrate the winner in one transaction.

## App Behavior

### Driver Side
- Drivers can place or update their own bid while the reservation is still open.
- Driver bid controls must surface the rider max budget when present.
- Driver bid controls must clamp suggestions, wheel options, and manual adjustments to the rider cap when present.
- Drivers should see pending reservations disappear once a reservation is no longer `pending`.
- Drivers should not be able to continue editing a bid after selection.

### Rider Side
- Riders should see all current bids for a pending reservation.
- Bid list ordering should be stable and predictable.
- The recommended default sort is:
  - lowest `amount_cents`
  - then earliest `created_at`
- For scheduled rides, riders should set `max_fare_cents` during reservation creation and understand that bids cannot exceed it.
- Rider selection UI must call the selection RPC, not write multiple tables directly.
- After selection, the rider UI should switch from bid comparison to reservation progress.
- The current rider entrypoint is the reservation details modal opened from the active reservation timeline.
- While a reservation is still `pending`, the rider home screen should surface live bidding state:
  - `Waiting for bids` when no active driver offers exist yet
  - `Offers Ready` once one or more active bids exist
- The rider home screen should expose a clear review action when active bids exist so the rider can open the reservation details modal and compare offers.

### Realtime Expectations
- New incoming bids should appear without requiring a manual refresh.
- The rider home screen should refresh when visible `reservation_bids` rows change so pending rides update their live status and offer count without reopening the app.
- Once a bid is selected:
  - the rider should immediately see the reservation leave the bid-comparison state
  - losing drivers should see the reservation leave their pending queue
  - the winning driver should see the reservation become assigned

## Reservation Status Semantics
- `pending`: open to bids
- `bid_selected`: rider chose a winning bid, assignment is decided
- `accepted`: driver accepted or assignment is fully confirmed, depending on final product rules
- `driver_en_route`: driver is heading to pickup
- `picked_up`: rider is in vehicle
- `completed`: trip finished
- `canceled`: reservation ended without fulfillment

If product behavior changes for when `bid_selected` transitions to `accepted`, update this document.

## Implementation Boundaries
- This flow currently applies to reservation rides, including scheduled rides that enter the bid marketplace.
- Pickup timezone logic is separate and does not change bid selection rules.
- Package delivery and pure on-demand ride booking may reuse this model later, but are not implicitly covered unless their implementation explicitly adopts it.

## Testing Requirements
- Multiple drivers can create bids for the same reservation.
- The same driver cannot create duplicate bids for the same reservation.
- Driver bids above `max_fare_cents` are rejected.
- Only one bid can become `selected`.
- Rider selection fails cleanly if the reservation is no longer `pending`.
- Rider selection fails cleanly if the chosen bid is no longer `active`.
- After selection:
  - winning bid is `selected`
  - losing bids are `rejected`
  - reservation fields are updated consistently
- Realtime-driven UI reflects both new bids and closed bidding.
- Rider home UI reflects pending bid activity, including the live status state and review-offers entrypoint.

## Documentation Maintenance Rule
- Any change to bidding, bid selection, assignment, related statuses, SQL policies, or reservation assignment fields must update this document in the same change.
