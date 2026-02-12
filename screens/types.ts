import type { LocationPoint } from "../lib/places/locationPoint";

export type Screen =
  | "home"
  | "signup"
  | "signin"
  | "whereto"
  | "package"
  | "schedule";

export type AccountRole = "rider" | "driver";

export type RideType = "Economy" | "XL" | "Luxury" | "Luxury SUV";
export type ReservationKind = "scheduled" | "ride" | "package";
export type ReservationStatus = "pending" | "accepted" | "completed" | "canceled";

/** Schedule form state held for the schedule flow; ready for API submission. */
export type SchedulePayload = {
  pickup: string;
  dropoff: string;
  pickupLocation?: LocationPoint | null;
  dropoffLocation?: LocationPoint | null;
  rideType: RideType;
  /** Selected date/time; use .toISOString() when sending to API. */
  scheduledAt: Date;
};

/** Serializable payload for scheduled reservation inserts. */
export type ScheduledReservationInsertPayload = {
  kind: "scheduled";
  pickup: string;
  dropoff: string;
  pickupLocation?: LocationPoint | null;
  dropoffLocation?: LocationPoint | null;
  rideType: RideType;
  scheduledAtIso: string;
};

export type ReservationRecord = {
  id: string;
  kind: ReservationKind;
  status: ReservationStatus;
  rideType: RideType;
  pickupLabel: string;
  dropoffLabel: string;
  scheduledAt: string;
  createdAt: string;
  canceledAt: string | null;
};
