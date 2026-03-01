import type { LocationPoint } from "../location/locationPoint";
import type { RideType } from "../ride/types";

export type ReservationKind = "scheduled" | "ride" | "package";

export type ReservationStatus =
  | "pending"
  | "accepted"
  | "driver_en_route"
  | "picked_up"
  | "completed"
  | "canceled";

export type SchedulePayload = {
  pickup: string;
  dropoff: string;
  pickupLocation?: LocationPoint | null;
  dropoffLocation?: LocationPoint | null;
  rideType: RideType;
  scheduledAt: Date;
};

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
  pickupLocation: LocationPoint | null;
  dropoffLabel: string;
  dropoffLocation: LocationPoint | null;
  scheduledAt: string;
  createdAt: string;
  canceledAt: string | null;
};
