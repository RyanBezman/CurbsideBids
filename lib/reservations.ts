import { supabase } from "./supabase";
import type {
  ReservationRecord,
  ReservationStatus,
  ScheduledReservationInsertPayload,
} from "../screens/types";

type CreateScheduledReservationInput = ScheduledReservationInsertPayload & {
  status?: Extract<ReservationStatus, "pending">;
};

type ReservationRow = {
  id: string;
  kind: "scheduled" | "ride" | "package";
  status: ReservationStatus;
  ride_type: ReservationRecord["rideType"];
  pickup_label: string;
  dropoff_label: string;
  scheduled_at: string;
  created_at: string;
  canceled_at: string | null;
};

function mapReservationRow(row: ReservationRow): ReservationRecord {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    rideType: row.ride_type,
    pickupLabel: row.pickup_label,
    dropoffLabel: row.dropoff_label,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    canceledAt: row.canceled_at,
  };
}

export async function createScheduledReservation(
  input: CreateScheduledReservationInput,
  userId: string,
): Promise<{ id: string }> {
  const pickup = input.pickup.trim();
  const dropoff = input.dropoff.trim();

  if (!pickup) {
    throw new Error("Pickup location is required.");
  }
  if (!dropoff) {
    throw new Error("Dropoff location is required.");
  }

  const scheduledDate = new Date(input.scheduledAtIso);
  if (Number.isNaN(scheduledDate.getTime())) {
    throw new Error("Scheduled date/time is invalid.");
  }
  if (scheduledDate.getTime() <= Date.now()) {
    throw new Error("Scheduled date/time must be in the future.");
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      user_id: userId,
      kind: "scheduled",
      status: input.status ?? "pending",
      pickup_label: pickup,
      pickup_lat: input.pickupLocation?.latitude ?? null,
      pickup_lng: input.pickupLocation?.longitude ?? null,
      dropoff_label: dropoff,
      dropoff_lat: input.dropoffLocation?.latitude ?? null,
      dropoff_lng: input.dropoffLocation?.longitude ?? null,
      ride_type: input.rideType,
      scheduled_at: scheduledDate.toISOString(),
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Failed to create scheduled reservation.");
  }

  return { id: data.id };
}

export async function listRecentReservations(
  userId: string,
  limit = 10,
): Promise<ReservationRecord[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, kind, status, ride_type, pickup_label, dropoff_label, scheduled_at, created_at, canceled_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || "Failed to load recent reservations.");
  }

  return (data ?? []).map((row) => mapReservationRow(row as ReservationRow));
}

export async function cancelReservation(
  id: string,
  userId: string,
): Promise<ReservationRecord> {
  const { data, error } = await supabase
    .from("reservations")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .in("status", ["pending", "accepted"])
    .select(
      "id, kind, status, ride_type, pickup_label, dropoff_label, scheduled_at, created_at, canceled_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to cancel reservation.");
  }

  return mapReservationRow(data as ReservationRow);
}
