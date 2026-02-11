# Project Context

## Product Vision
- Build Curbside as a reservations-first rider app with simple, reliable booking.
- Grow in small steps; avoid overengineering early.
- Add driver marketplace behavior later, after reservation fundamentals are solid.

## Current Stack and Architecture
- Expo React Native app (TypeScript + NativeWind).
- Supabase Auth for user accounts and sessions.
- Location search via OpenStreetMap Nominatim with debounced autocomplete.
- Single app currently focused on rider-side request flows.

## What Is Implemented Now
- Auth: sign up, sign in, sign out.
- Location UX:
  - Autocomplete for pickup and dropoff.
  - Structured location state with full label + lat/lng.
  - Shortened display labels in inputs for readability.
  - Pickup auto-fill from device location (when permitted).
- Flows/screens:
  - Ride request, package request, scheduled ride forms.
  - Ride type selection UI and schedule date/time picker.

## Current Product Decisions
- US-only by default for location behavior.
- Sign-in is required at submit (not necessarily at entry) for future booking persistence.
- No live driver marketplace in v1.
- Driver role is collected at signup and stored in user metadata.

## Incremental Roadmap (Placeholders)
- Step 2: Persist reservations (ride/package/scheduled) to backend with validation.
- Step 3: Add reservations list + status tracking for users.
- Step 4: Introduce driver-facing capabilities when reservations flow is stable.

