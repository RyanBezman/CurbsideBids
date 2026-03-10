import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatBidAmount,
  type ReservationBidRecord,
  type ReservationRecord,
} from "@domain/reservations";
import type { PendingReservationCardBidInput } from "@features/home/components";
import { listDriverReservationBids, upsertReservationBid } from "@features/reservations";

type UseDriverReservationBidsOptions = {
  isDriver: boolean;
  reservationIds: string[];
  userId: string;
  listDriverReservationBidsFn?: typeof listDriverReservationBids;
  upsertReservationBidFn?: typeof upsertReservationBid;
};

type SubmitBidInput = {
  reservation: ReservationRecord;
  estimatedTripMinutes: number | null;
  input: PendingReservationCardBidInput;
};

export function useDriverReservationBids({
  isDriver,
  reservationIds,
  userId,
  listDriverReservationBidsFn = listDriverReservationBids,
  upsertReservationBidFn = upsertReservationBid,
}: UseDriverReservationBidsOptions) {
  const [isLoadingDriverBids, setIsLoadingDriverBids] = useState(false);
  const [submittingBidReservationId, setSubmittingBidReservationId] = useState<string | null>(
    null,
  );
  const [driverBidsByReservationId, setDriverBidsByReservationId] = useState<
    Record<string, ReservationBidRecord>
  >({});
  const reservationIdSet = useMemo(() => new Set(reservationIds), [reservationIds]);

  useEffect(() => {
    if (!isDriver) return;
    if (reservationIds.length === 0) {
      setDriverBidsByReservationId({});
      setIsLoadingDriverBids(false);
      return;
    }

    let isSubscribed = true;
    setIsLoadingDriverBids(true);

    void (async () => {
      try {
        const bids = await listDriverReservationBidsFn(userId, 200);
        if (!isSubscribed) return;

        const nextByReservationId: Record<string, ReservationBidRecord> = {};

        for (const bid of bids) {
          if (!reservationIdSet.has(bid.reservationId)) continue;
          nextByReservationId[bid.reservationId] = bid;
        }

        setDriverBidsByReservationId(nextByReservationId);
      } catch (error) {
        console.warn("Unable to load driver reservation bids", error);
      } finally {
        if (isSubscribed) {
          setIsLoadingDriverBids(false);
        }
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [isDriver, listDriverReservationBidsFn, reservationIdSet, reservationIds.length, userId]);

  const submitBidForReservation = useCallback(
    async ({ reservation, estimatedTripMinutes, input }: SubmitBidInput) => {
      setSubmittingBidReservationId(reservation.id);
      try {
        if (
          reservation.maxFareCents !== null &&
          input.amountCents > reservation.maxFareCents
        ) {
          throw new Error(
            `This rider only accepts bids up to ${formatBidAmount(
              reservation.maxFareCents,
            )}.`,
          );
        }

        const bid = await upsertReservationBidFn(
          {
            reservationId: reservation.id,
            amountCents: input.amountCents,
            etaMinutes: estimatedTripMinutes,
            note: input.note,
          },
          userId,
        );

        setDriverBidsByReservationId((previous) => ({
          ...previous,
          [reservation.id]: bid,
        }));

        return bid;
      } finally {
        setSubmittingBidReservationId((current) =>
          current === reservation.id ? null : current,
        );
      }
    },
    [upsertReservationBidFn, userId],
  );

  return {
    driverBidsByReservationId,
    isLoadingDriverBids,
    submittingBidReservationId,
    submitBidForReservation,
  };
}
