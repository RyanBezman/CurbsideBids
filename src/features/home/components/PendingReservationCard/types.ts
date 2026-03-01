import type { ReservationRecord } from "@domain/reservations";

export type PendingReservationCardBidInput = {
  amountCents: number;
  note: string | null;
};

export type PendingReservationCardProps = {
  reservation: ReservationRecord;
  estimatedTripMinutes: number | null;
  existingBidAmountCents: number | null;
  existingBidNote: string | null;
  isLoadingExistingBid: boolean;
  isSubmittingBid: boolean;
  onSubmitBid: (input: PendingReservationCardBidInput) => Promise<void>;
};
