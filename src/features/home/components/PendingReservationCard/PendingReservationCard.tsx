import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { estimateTripDistanceMiles } from "@domain/location";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import { PendingReservationCardHeader } from "./PendingReservationCardHeader";
import { PendingReservationRoute } from "./PendingReservationRoute";
import { BidComposerPanel } from "./BidComposerPanel";
import { formatBidAmount } from "./bidPricing";
import { useBidComposerState } from "./useBidComposerState";
import type { PendingReservationCardProps } from "./types";

export function PendingReservationCard({
  reservation,
  estimatedTripMinutes,
  existingBidAmountCents,
  existingBidNote,
  isLoadingExistingBid,
  isSubmittingBid,
  onSubmitBid,
}: PendingReservationCardProps) {
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;
  const estimatedTripMiles = estimateTripDistanceMiles(
    reservation.pickupLocation,
    reservation.dropoffLocation,
  );
  const hasExistingBid = existingBidAmountCents !== null;

  const {
    activeBidAmountCents,
    activeBidIndex,
    handleSelectAmount,
    handleSubmitBid,
    handleWheelScroll,
    handleWheelEnd,
    isBidComposerOpen,
    isNoteOpen,
    noteText,
    setIsBidComposerOpen,
    setIsNoteOpen,
    setNoteText,
    setSubmissionError,
    suggestedBidAmountCents,
    submissionError,
    wheelOptions,
    wheelRef,
  } = useBidComposerState({
    estimatedTripMiles,
    estimatedTripMinutes,
    existingBidAmountCents,
    existingBidNote,
    onSubmitBid,
    maxFareCents: reservation.maxFareCents,
  });

  const summaryAmountCents = hasExistingBid
    ? existingBidAmountCents
    : suggestedBidAmountCents;
  const closeBidComposer = () => {
    setSubmissionError(null);
    setIsBidComposerOpen(false);
  };

  return (
    <>
      <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <PendingReservationCardHeader
          rideType={reservation.rideType}
          scheduledAt={reservation.scheduledAt}
          scheduledTimeZone={reservation.pickupLocation?.timeZone}
          estimatedTripMinutes={estimatedTripMinutes}
          rideImage={rideImage ?? null}
        />

        <PendingReservationRoute
          pickupLabel={reservation.pickupLabel}
          dropoffLabel={reservation.dropoffLabel}
        />

        <View className="mt-4 flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              {hasExistingBid ? "Your bid" : "Bid"}
            </Text>
            <Text className="mt-1 text-2xl font-semibold text-white">
              {formatBidAmount(summaryAmountCents)}
            </Text>
            {existingBidNote?.trim() ? (
              <Text className="mt-1 text-xs text-neutral-500">Note included</Text>
            ) : null}
          </View>
          {reservation.maxFareCents !== null ? (
            <Text className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
              Max {formatBidAmount(reservation.maxFareCents)}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isLoadingExistingBid || isSubmittingBid}
          onPress={() => {
            setSubmissionError(null);
            setIsBidComposerOpen(true);
          }}
          className="mt-4 rounded-2xl bg-white py-3 items-center"
          testID="toggle-bid-composer"
        >
          {isLoadingExistingBid ? (
            <ActivityIndicator color="#f8fafc" size="small" />
          ) : (
            <Text className="text-sm font-semibold text-neutral-950">
              {hasExistingBid ? "Edit bid" : "Place bid"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={isBidComposerOpen}
        onRequestClose={closeBidComposer}
      >
        <Pressable
          className="flex-1 justify-end bg-black/65"
          onPress={closeBidComposer}
          testID="bid-composer-backdrop"
        >
          <Pressable
            onPress={() => {}}
          >
            <BidComposerPanel
              activeBidAmountCents={activeBidAmountCents}
              activeBidIndex={activeBidIndex}
              hasExistingBid={hasExistingBid}
              isNoteOpen={isNoteOpen}
              isSubmittingBid={isSubmittingBid}
              maxFareCents={reservation.maxFareCents}
              noteText={noteText}
              onRequestClose={closeBidComposer}
              submissionError={submissionError}
              suggestedBidAmountCents={suggestedBidAmountCents}
              wheelOptions={wheelOptions}
              onSetWheelRef={(instance) => {
                wheelRef.current = instance;
              }}
              onWheelScroll={handleWheelScroll}
              onWheelEnd={handleWheelEnd}
              onSelectWheelAmount={(amountCents) => {
                handleSelectAmount(amountCents);
              }}
              onToggleNote={() => setIsNoteOpen((prev) => !prev)}
              onNoteChange={setNoteText}
              onSubmitBid={() => {
                void handleSubmitBid();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
