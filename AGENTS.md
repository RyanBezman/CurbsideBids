# Agent Instructions

## TypeScript
- Never use `any` in TypeScript files (`.ts`, `.tsx`, `.d.ts`).
- Prefer explicit domain types, generics, unions, or `unknown` with type narrowing.

## Documentation
- The rider bid selection and concurrent reservation bidding flow is documented in `docs/rider-bid-selection-flow.md`.
- Any change to this flow must update that document in the same change. This includes schema, policies, RPC behavior, reservation statuses, realtime behavior, rider selection UX, driver bidding rules, and any logic touching `reservation_bids`, `selected_bid_id`, or reservation assignment.
