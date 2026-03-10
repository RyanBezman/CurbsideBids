import { useCallback, useEffect, useState } from "react";
import type { ReservationBidRecord, ReservationRecord } from "@domain/reservations";
import { supabase } from "@shared/api";
import { listReservationBids, selectReservationBid } from "../api";

type UseReservationBidSelectionOptions = {
  reservation: ReservationRecord | null;
  listReservationBidsFn?: typeof listReservationBids;
  onBidSelected?: (reservation: ReservationRecord) => Promise<void> | void;
  selectReservationBidFn?: typeof selectReservationBid;
};

function shouldLoadBids(reservation: ReservationRecord | null): reservation is ReservationRecord {
  return reservation?.status === "pending";
}

export function useReservationBidSelection({
  reservation,
  listReservationBidsFn = listReservationBids,
  onBidSelected,
  selectReservationBidFn = selectReservationBid,
}: UseReservationBidSelectionOptions) {
  const [bids, setBids] = useState<ReservationBidRecord[]>([]);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [isSelectingBidId, setIsSelectingBidId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadBids = useCallback(async () => {
    if (!shouldLoadBids(reservation)) {
      setBids([]);
      setLoadError(null);
      setIsLoadingBids(false);
      return;
    }

    setIsLoadingBids(true);
    setLoadError(null);

    try {
      const nextBids = await listReservationBidsFn(reservation.id);
      setBids(nextBids);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load bids for this ride.";
      setLoadError(message);
    } finally {
      setIsLoadingBids(false);
    }
  }, [listReservationBidsFn, reservation]);

  useEffect(() => {
    void loadBids();
  }, [loadBids]);

  useEffect(() => {
    if (!shouldLoadBids(reservation)) return;

    const channel = supabase
      .channel(`reservation-bids-${reservation.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reservation_bids",
          filter: `reservation_id=eq.${reservation.id}`,
        },
        () => {
          void loadBids();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadBids, reservation]);

  const handleSelectBid = useCallback(
    async (bidId: string) => {
      if (!shouldLoadBids(reservation)) {
        throw new Error("Reservation is no longer open for bid selection.");
      }

      setIsSelectingBidId(bidId);
      try {
        const updatedReservation = await selectReservationBidFn(reservation.id, bidId);
        await onBidSelected?.(updatedReservation);
        return updatedReservation;
      } finally {
        setIsSelectingBidId((current) => (current === bidId ? null : current));
      }
    },
    [onBidSelected, reservation, selectReservationBidFn],
  );

  return {
    bids,
    isLoadingBids,
    isSelectingBidId,
    loadBids,
    loadError,
    onSelectBid: handleSelectBid,
  };
}
