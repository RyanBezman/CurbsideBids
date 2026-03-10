import type {
  ReservationBidRecord,
  ReservationBidStatus,
  ReservationRecord,
  UpsertReservationBidPayload,
} from "@domain/reservations";
import { supabase } from "@shared/api/supabase/client";
import type { ReservationBidsDataSource } from "./contracts";

type ReservationBidRow = {
  id: string;
  reservation_id: string;
  driver_id: string;
  amount_cents: number;
  eta_minutes: number | null;
  note: string | null;
  status: ReservationBidStatus;
  created_at: string;
  updated_at: string;
};

type ReservationSelectResultRow = {
  id: string;
  kind: ReservationRecord["kind"];
  status: ReservationRecord["status"];
  driver_id: string | null;
  selected_bid_id: string | null;
  agreed_fare_cents: number | null;
  max_fare_cents: number | null;
  ride_type: ReservationRecord["rideType"];
  pickup_label: string;
  pickup_time_zone?: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_label: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  scheduled_at: string;
  created_at: string;
  canceled_at: string | null;
};

const MAX_BID_NOTE_LENGTH = 280;
const BID_SELECT_COLUMNS =
  "id, reservation_id, driver_id, amount_cents, eta_minutes, note, status, created_at, updated_at";

function mapReservationBidRow(row: ReservationBidRow): ReservationBidRecord {
  return {
    id: row.id,
    reservationId: row.reservation_id,
    driverId: row.driver_id,
    amountCents: row.amount_cents,
    etaMinutes: row.eta_minutes,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReservationRecord(row: ReservationSelectResultRow): ReservationRecord {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    driverId: row.driver_id,
    selectedBidId: row.selected_bid_id,
    activeBidCount: 0,
    agreedFareCents: row.agreed_fare_cents,
    maxFareCents: row.max_fare_cents,
    rideType: row.ride_type,
    pickupLabel: row.pickup_label,
    pickupLocation:
      row.pickup_lat === null || row.pickup_lng === null
        ? null
        : {
            label: row.pickup_label,
            latitude: row.pickup_lat,
            longitude: row.pickup_lng,
            timeZone: row.pickup_time_zone ?? undefined,
            provider: "nominatim",
          },
    dropoffLabel: row.dropoff_label,
    dropoffLocation:
      row.dropoff_lat === null || row.dropoff_lng === null
        ? null
        : {
            label: row.dropoff_label,
            latitude: row.dropoff_lat,
            longitude: row.dropoff_lng,
            provider: "nominatim",
          },
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    canceledAt: row.canceled_at,
  };
}

function normalizeBidNote(note: string | null | undefined): string | null {
  if (!note) return null;
  const trimmed = note.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_BID_NOTE_LENGTH) {
    throw new Error(`Bid note must be ${MAX_BID_NOTE_LENGTH} characters or fewer.`);
  }
  return trimmed;
}

function validateUpsertBidPayload(input: UpsertReservationBidPayload): void {
  if (!input.reservationId.trim()) {
    throw new Error("Reservation id is required.");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error("Bid amount must be a positive whole number in cents.");
  }
  if (
    input.etaMinutes !== undefined &&
    input.etaMinutes !== null &&
    (!Number.isInteger(input.etaMinutes) || input.etaMinutes <= 0)
  ) {
    throw new Error("ETA minutes must be a positive whole number.");
  }
}

export const supabaseReservationBidsDataSource: ReservationBidsDataSource = {
  async upsertReservationBid(
    input: UpsertReservationBidPayload,
    driverId: string,
  ): Promise<ReservationBidRecord> {
    validateUpsertBidPayload(input);

    const { data, error } = await supabase
      .from("reservation_bids")
      .upsert(
        {
          reservation_id: input.reservationId.trim(),
          driver_id: driverId,
          amount_cents: input.amountCents,
          eta_minutes: input.etaMinutes ?? null,
          note: normalizeBidNote(input.note),
          status: "active",
        },
        { onConflict: "reservation_id,driver_id" },
      )
      .select(BID_SELECT_COLUMNS)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to place reservation bid.");
    }

    return mapReservationBidRow(data as ReservationBidRow);
  },

  async listReservationBids(reservationId: string): Promise<ReservationBidRecord[]> {
    const trimmedReservationId = reservationId.trim();
    if (!trimmedReservationId) {
      throw new Error("Reservation id is required.");
    }

    const { data, error } = await supabase
      .from("reservation_bids")
      .select(BID_SELECT_COLUMNS)
      .eq("reservation_id", trimmedReservationId)
      .order("amount_cents", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message || "Failed to load reservation bids.");
    }

    return (data ?? []).map((row) => mapReservationBidRow(row as ReservationBidRow));
  },

  async listDriverReservationBids(
    driverId: string,
    limit = 50,
  ): Promise<ReservationBidRecord[]> {
    const trimmedDriverId = driverId.trim();
    if (!trimmedDriverId) {
      throw new Error("Driver id is required.");
    }

    const { data, error } = await supabase
      .from("reservation_bids")
      .select(BID_SELECT_COLUMNS)
      .eq("driver_id", trimmedDriverId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message || "Failed to load driver reservation bids.");
    }

    return (data ?? []).map((row) => mapReservationBidRow(row as ReservationBidRow));
  },

  async selectReservationBid(
    reservationId: string,
    bidId: string,
  ): Promise<ReservationRecord> {
    const trimmedReservationId = reservationId.trim();
    const trimmedBidId = bidId.trim();
    if (!trimmedReservationId) {
      throw new Error("Reservation id is required.");
    }
    if (!trimmedBidId) {
      throw new Error("Bid id is required.");
    }

    const { data, error } = await supabase.rpc("select_reservation_bid", {
      input_reservation_id: trimmedReservationId,
      input_bid_id: trimmedBidId,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to select reservation bid.");
    }

    return mapReservationRecord(data as ReservationSelectResultRow);
  },
};
