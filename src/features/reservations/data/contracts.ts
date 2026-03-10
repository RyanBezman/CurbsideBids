import type {
  ReservationBidRecord,
  ReservationRecord,
  ReservationStatus,
  ScheduledReservationInsertPayload,
  UpsertReservationBidPayload,
} from "@domain/reservations";

export type CreateScheduledReservationInput = ScheduledReservationInsertPayload & {
  status?: Extract<ReservationStatus, "pending">;
};

export interface ReservationsDataSource {
  createScheduledReservation(
    input: CreateScheduledReservationInput,
    userId: string,
  ): Promise<{ id: string }>;
  listRecentReservations(userId: string, limit?: number): Promise<ReservationRecord[]>;
  listPendingRideReservations(limit?: number): Promise<ReservationRecord[]>;
  cancelReservation(id: string, userId: string): Promise<ReservationRecord>;
}

export interface ReservationBidsDataSource {
  upsertReservationBid(
    input: UpsertReservationBidPayload,
    driverId: string,
  ): Promise<ReservationBidRecord>;
  listReservationBids(reservationId: string): Promise<ReservationBidRecord[]>;
  listDriverReservationBids(driverId: string, limit?: number): Promise<ReservationBidRecord[]>;
  selectReservationBid(
    reservationId: string,
    bidId: string,
  ): Promise<ReservationRecord>;
}
