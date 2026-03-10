import type { LocationPoint } from "../location/locationPoint";
import type { RideType } from "../ride/types";

export type ReservationKind = "scheduled" | "ride" | "package";

export type ReservationStatus =
  | "pending"
  | "bid_selected"
  | "accepted"
  | "driver_en_route"
  | "picked_up"
  | "completed"
  | "canceled";

export type ReservationBidStatus =
  | "active"
  | "selected"
  | "rejected"
  | "withdrawn";

export type SchedulePayload = {
  pickup: string;
  dropoff: string;
  pickupLocation?: LocationPoint | null;
  dropoffLocation?: LocationPoint | null;
  maxFareCents: number;
  rideType: RideType;
  scheduledAt: Date;
};

export type ScheduledReservationInsertPayload = {
  kind: "scheduled";
  pickup: string;
  dropoff: string;
  pickupLocation?: LocationPoint | null;
  dropoffLocation?: LocationPoint | null;
  maxFareCents: number;
  rideType: RideType;
  scheduledAtIso: string;
};

export type ReservationRecord = {
  id: string;
  kind: ReservationKind;
  status: ReservationStatus;
  driverId: string | null;
  selectedBidId: string | null;
  agreedFareCents: number | null;
  maxFareCents: number | null;
  rideType: RideType;
  pickupLabel: string;
  pickupLocation: LocationPoint | null;
  dropoffLabel: string;
  dropoffLocation: LocationPoint | null;
  scheduledAt: string;
  createdAt: string;
  canceledAt: string | null;
};

export type ReservationBidRecord = {
  id: string;
  reservationId: string;
  driverId: string;
  amountCents: number;
  etaMinutes: number | null;
  note: string | null;
  status: ReservationBidStatus;
  createdAt: string;
  updatedAt: string;
};

export type UpsertReservationBidPayload = {
  reservationId: string;
  amountCents: number;
  etaMinutes?: number | null;
  note?: string | null;
};
