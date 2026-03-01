import type {
  ReservationRecord,
  ReservationStatus,
  ScheduledReservationInsertPayload,
} from "../../../domain/reservations";
import { supabase } from "../../../shared/api/supabase/client";
import type {
  LocationPoint,
} from "../../../domain/location/locationPoint";

type CreateScheduledReservationInput = ScheduledReservationInsertPayload & {
  status?: Extract<ReservationStatus, "pending">;
};

type ReservationRow = {
  id: string;
  kind: "scheduled" | "ride" | "package";
  status: ReservationStatus;
  driver_id: string | null;
  selected_bid_id: string | null;
  agreed_fare_cents: number | null;
  ride_type: ReservationRecord["rideType"];
  pickup_label: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_label: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  scheduled_at: string;
  created_at: string;
  canceled_at: string | null;
};

function nullableLocationPoint(value: LocationPoint | null | undefined): LocationPoint | null {
  return value ?? null;
}

function mapStoredLocationPoint(
  label: string,
  latitude: number | null,
  longitude: number | null,
): LocationPoint | null {
  if (latitude === null || longitude === null) return null;

  return {
    label,
    latitude,
    longitude,
    provider: "nominatim",
  };
}

function mapReservationRow(row: ReservationRow): ReservationRecord {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    driverId: row.driver_id,
    selectedBidId: row.selected_bid_id,
    agreedFareCents: row.agreed_fare_cents,
    rideType: row.ride_type,
    pickupLabel: row.pickup_label,
    pickupLocation: mapStoredLocationPoint(row.pickup_label, row.pickup_lat, row.pickup_lng),
    dropoffLabel: row.dropoff_label,
    dropoffLocation: mapStoredLocationPoint(row.dropoff_label, row.dropoff_lat, row.dropoff_lng),
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
  if (scheduledDate.getTime() - Date.now() < 60 * 60 * 1000) {
    throw new Error("Scheduled date/time must be at least 1 hour in the future.");
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      user_id: userId,
      kind: "scheduled",
      status: input.status ?? "pending",
      pickup_label: pickup,
      pickup_lat: nullableLocationPoint(input.pickupLocation)?.latitude ?? null,
      pickup_lng: nullableLocationPoint(input.pickupLocation)?.longitude ?? null,
      dropoff_label: dropoff,
      dropoff_lat: nullableLocationPoint(input.dropoffLocation)?.latitude ?? null,
      dropoff_lng: nullableLocationPoint(input.dropoffLocation)?.longitude ?? null,
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
      "id, kind, status, driver_id, selected_bid_id, agreed_fare_cents, ride_type, pickup_label, pickup_lat, pickup_lng, dropoff_label, dropoff_lat, dropoff_lng, scheduled_at, created_at, canceled_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || "Failed to load recent reservations.");
  }

  return (data ?? []).map((row) => mapReservationRow(row as ReservationRow));
}

export async function listPendingRideReservations(
  limit = 50,
): Promise<ReservationRecord[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, kind, status, driver_id, selected_bid_id, agreed_fare_cents, ride_type, pickup_label, pickup_lat, pickup_lng, dropoff_label, dropoff_lat, dropoff_lng, scheduled_at, created_at, canceled_at",
    )
    .eq("status", "pending")
    .in("kind", ["ride", "scheduled"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message || "Failed to load pending reservation rides.");
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
    .in("status", ["pending", "bid_selected", "accepted"])
    .select(
      "id, kind, status, driver_id, selected_bid_id, agreed_fare_cents, ride_type, pickup_label, pickup_lat, pickup_lng, dropoff_label, dropoff_lat, dropoff_lng, scheduled_at, created_at, canceled_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to cancel reservation.");
  }

  return mapReservationRow(data as ReservationRow);
}
