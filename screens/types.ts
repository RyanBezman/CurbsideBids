import type { LocationPoint } from "../lib/places/locationPoint";

export type Screen =
  | "home"
  | "signup"
  | "signin"
  | "whereto"
  | "package"
  | "schedule";

export type RideType = "Economy" | "XL" | "Luxury" | "Luxury SUV";

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
