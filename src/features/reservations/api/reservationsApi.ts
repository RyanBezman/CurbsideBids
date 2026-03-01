import type {
  ReservationRecord,
  ReservationStatus,
  ScheduledReservationInsertPayload,
} from "@domain/reservations";
import {
  supabaseReservationsDataSource,
  type CreateScheduledReservationInput,
} from "@features/reservations/data";

type CreateScheduledReservationApiInput = ScheduledReservationInsertPayload & {
  status?: Extract<ReservationStatus, "pending">;
};

function toCreateScheduledReservationInput(
  input: CreateScheduledReservationApiInput,
): CreateScheduledReservationInput {
  return input;
}

export async function createScheduledReservation(
  input: CreateScheduledReservationApiInput,
  userId: string,
): Promise<{ id: string }> {
  return supabaseReservationsDataSource.createScheduledReservation(
    toCreateScheduledReservationInput(input),
    userId,
  );
}

export async function listRecentReservations(
  userId: string,
  limit = 10,
): Promise<ReservationRecord[]> {
  return supabaseReservationsDataSource.listRecentReservations(userId, limit);
}

export async function listPendingRideReservations(
  limit = 50,
): Promise<ReservationRecord[]> {
  return supabaseReservationsDataSource.listPendingRideReservations(limit);
}

export async function cancelReservation(
  id: string,
  userId: string,
): Promise<ReservationRecord> {
  return supabaseReservationsDataSource.cancelReservation(id, userId);
}
