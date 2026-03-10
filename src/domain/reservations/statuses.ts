import type { ReservationStatus } from "./types";

export const ACTIVE_RESERVATION_STATUSES = [
  "pending",
  "bid_selected",
  "accepted",
  "driver_en_route",
  "picked_up",
] as const satisfies readonly ReservationStatus[];

export const CANCELABLE_RESERVATION_STATUSES = [
  "pending",
  "bid_selected",
  "accepted",
] as const satisfies readonly ReservationStatus[];

const activeReservationStatusSet: ReadonlySet<ReservationStatus> = new Set(
  ACTIVE_RESERVATION_STATUSES,
);
const cancelableReservationStatusSet: ReadonlySet<ReservationStatus> = new Set(
  CANCELABLE_RESERVATION_STATUSES,
);

export function isActiveReservationStatus(status: ReservationStatus): boolean {
  return activeReservationStatusSet.has(status);
}

export function canCancelReservationStatus(status: ReservationStatus): boolean {
  return cancelableReservationStatusSet.has(status);
}
