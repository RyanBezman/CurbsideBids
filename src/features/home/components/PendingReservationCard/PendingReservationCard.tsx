import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { estimateTripDistanceMiles } from "@domain/location";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import { PendingReservationCardHeader } from "./PendingReservationCardHeader";
import { PendingReservationRoute } from "./PendingReservationRoute";
import { BidComposerPanel } from "./BidComposerPanel";
import { formatBidAmount } from "./bidPricing";
import { useBidComposerState } from "./useBidComposerState";
import type { PendingReservationCardProps } from "./types";

type ExistingBidBannerProps = {
  existingBidAmountCents: number;
  existingBidNote: string | null;
};

function ExistingBidBanner({ existingBidAmountCents, existingBidNote }: ExistingBidBannerProps) {
  return (
    <View className="mt-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2.5">
      <View className="flex-row items-center justify-between">
        <Text className="text-emerald-200 text-xs font-medium">
          Your bid: {formatBidAmount(existingBidAmountCents)}
        </Text>
        <Text className="text-emerald-300/80 text-[11px]">
          {existingBidNote?.trim() ? "Note included" : "No note"}
        </Text>
      </View>
    </View>
  );
}

type RiderMaxFareBannerProps = {
  maxFareCents: number;
};

function RiderMaxFareBanner({ maxFareCents }: RiderMaxFareBannerProps) {
  return (
    <View className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5">
      <Text className="text-amber-200 text-xs font-medium">
        Rider max budget: {formatBidAmount(maxFareCents)}
      </Text>
      <Text className="text-amber-100/75 text-[11px] mt-1">
        Stay at or below this amount to keep the bid valid.
      </Text>
    </View>
  );
}

type BidComposerToggleButtonProps = {
  hasExistingBid: boolean;
  isBidComposerOpen: boolean;
  isLoadingExistingBid: boolean;
  isSubmittingBid: boolean;
  onPress: () => void;
};

function BidComposerToggleButton({
  hasExistingBid,
  isBidComposerOpen,
  isLoadingExistingBid,
  isSubmittingBid,
  onPress,
}: BidComposerToggleButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isLoadingExistingBid || isSubmittingBid}
      onPress={onPress}
      className={`mt-3 rounded-xl py-2.5 items-center ${
        isBidComposerOpen
          ? "bg-neutral-800 border border-neutral-700"
          : "bg-emerald-600 border border-emerald-500/80"
      }`}
      testID="toggle-bid-composer"
    >
      {isLoadingExistingBid ? (
        <ActivityIndicator color="#f8fafc" size="small" />
      ) : (
        <Text className="text-white text-sm font-semibold">
          {isBidComposerOpen ? "Close Bid Form" : hasExistingBid ? "Update Bid" : "Place Bid"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

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
    handleWheelEnd,
    isBidComposerOpen,
    isNoteOpen,
    noteText,
    nudgeBidAmount,
    pricingBreakdown,
    setIsBidComposerOpen,
    setIsNoteOpen,
    setNoteText,
    setSubmissionError,
    suggestedBidAmountCents,
    submissionError,
    wheelOptions,
    wheelRef,
    wheelStepCents,
  } = useBidComposerState({
    estimatedTripMiles,
    estimatedTripMinutes,
    existingBidAmountCents,
    existingBidNote,
    onSubmitBid,
    maxFareCents: reservation.maxFareCents,
  });

  return (
    <View className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
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

      {hasExistingBid ? (
        <ExistingBidBanner
          existingBidAmountCents={existingBidAmountCents}
          existingBidNote={existingBidNote}
        />
      ) : null}

      {reservation.maxFareCents !== null ? (
        <RiderMaxFareBanner maxFareCents={reservation.maxFareCents} />
      ) : null}

      <BidComposerToggleButton
        hasExistingBid={hasExistingBid}
        isBidComposerOpen={isBidComposerOpen}
        isLoadingExistingBid={isLoadingExistingBid}
        isSubmittingBid={isSubmittingBid}
        onPress={() => {
          setSubmissionError(null);
          setIsBidComposerOpen((prev) => !prev);
        }}
      />

      {isBidComposerOpen ? (
        <BidComposerPanel
          activeBidAmountCents={activeBidAmountCents}
          activeBidIndex={activeBidIndex}
          hasExistingBid={hasExistingBid}
          isNoteOpen={isNoteOpen}
          isSubmittingBid={isSubmittingBid}
          maxFareCents={reservation.maxFareCents}
          noteText={noteText}
          submissionError={submissionError}
          suggestedBidAmountCents={suggestedBidAmountCents}
          tripBreakdownLabel={pricingBreakdown.tripBreakdownLabel}
          mileageComponentCents={pricingBreakdown.mileageComponentCents}
          timeComponentCents={pricingBreakdown.timeComponentCents}
          wheelOptions={wheelOptions}
          onSetWheelRef={(instance) => {
            wheelRef.current = instance;
          }}
          onWheelEnd={handleWheelEnd}
          onSelectWheelAmount={(amountCents) => {
            handleSelectAmount(amountCents);
          }}
          onDecreaseBid={() => nudgeBidAmount(-wheelStepCents)}
          onIncreaseBid={() => nudgeBidAmount(wheelStepCents)}
          onToggleNote={() => setIsNoteOpen((prev) => !prev)}
          onNoteChange={setNoteText}
          onSubmitBid={() => {
            void handleSubmitBid();
          }}
        />
      ) : null}
    </View>
  );
}
