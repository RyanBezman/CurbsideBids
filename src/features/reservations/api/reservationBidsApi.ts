import type {
  ReservationBidRecord,
  ReservationRecord,
  UpsertReservationBidPayload,
} from "@domain/reservations";
import { supabaseReservationBidsDataSource } from "@features/reservations/data";

export async function upsertReservationBid(
  input: UpsertReservationBidPayload,
  driverId: string,
): Promise<ReservationBidRecord> {
  return supabaseReservationBidsDataSource.upsertReservationBid(input, driverId);
}

export async function listReservationBids(
  reservationId: string,
): Promise<ReservationBidRecord[]> {
  return supabaseReservationBidsDataSource.listReservationBids(reservationId);
}

export async function listDriverReservationBids(
  driverId: string,
  limit = 50,
): Promise<ReservationBidRecord[]> {
  return supabaseReservationBidsDataSource.listDriverReservationBids(driverId, limit);
}

export async function selectReservationBid(
  reservationId: string,
  bidId: string,
): Promise<ReservationRecord> {
  return supabaseReservationBidsDataSource.selectReservationBid(reservationId, bidId);
}
