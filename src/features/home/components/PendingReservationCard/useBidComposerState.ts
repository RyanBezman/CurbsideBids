import { useEffect, useMemo, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from "react-native";
import {
  buildBidWheelOptions,
  clampBidAmount,
  getBidPricingBreakdown,
  getClosestWheelIndex,
  getSuggestedBidAmountCents,
  WHEEL_STEP_CENTS,
} from "./bidPricing";
import { WHEEL_ITEM_HEIGHT } from "./BidAmountWheel";
import type { PendingReservationCardBidInput } from "./types";

type UseBidComposerStateOptions = {
  estimatedTripMiles: number | null;
  estimatedTripMinutes: number | null;
  existingBidAmountCents: number | null;
  existingBidNote: string | null;
  maxFareCents: number | null;
  onSubmitBid: (input: PendingReservationCardBidInput) => Promise<void>;
};

export function useBidComposerState({
  estimatedTripMiles,
  estimatedTripMinutes,
  existingBidAmountCents,
  existingBidNote,
  maxFareCents,
  onSubmitBid,
}: UseBidComposerStateOptions) {
  const [isBidComposerOpen, setIsBidComposerOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [selectedBidAmountCents, setSelectedBidAmountCents] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const wheelRef = useRef<ScrollView | null>(null);

  const suggestedBidAmountCents = useMemo(
    () =>
      clampBidAmount(
        getSuggestedBidAmountCents(estimatedTripMiles, estimatedTripMinutes),
        maxFareCents ?? undefined,
      ),
    [estimatedTripMiles, estimatedTripMinutes, maxFareCents],
  );
  const wheelCenterAmountCents = existingBidAmountCents ?? suggestedBidAmountCents;
  const wheelOptions = useMemo(
    () => buildBidWheelOptions(wheelCenterAmountCents, maxFareCents ?? undefined),
    [wheelCenterAmountCents, maxFareCents],
  );
  const activeBidAmountCents = selectedBidAmountCents ?? suggestedBidAmountCents;
  const activeBidIndex = useMemo(
    () => getClosestWheelIndex(wheelOptions, activeBidAmountCents),
    [activeBidAmountCents, wheelOptions],
  );
  const pricingBreakdown = useMemo(
    () => getBidPricingBreakdown(estimatedTripMiles, estimatedTripMinutes),
    [estimatedTripMiles, estimatedTripMinutes],
  );

  useEffect(() => {
    if (existingBidAmountCents === null) return;

    setSelectedBidAmountCents(
      clampBidAmount(existingBidAmountCents, maxFareCents ?? undefined),
    );
    setNoteText(existingBidNote ?? "");
    setIsNoteOpen(Boolean(existingBidNote?.trim()));
  }, [existingBidAmountCents, existingBidNote, maxFareCents]);

  useEffect(() => {
    setSelectedBidAmountCents((previous) => {
      if (previous === null) return previous;
      return clampBidAmount(previous, maxFareCents ?? undefined);
    });
  }, [maxFareCents]);

  useEffect(() => {
    if (!isBidComposerOpen || selectedBidAmountCents !== null) return;

    setSelectedBidAmountCents(suggestedBidAmountCents);
  }, [isBidComposerOpen, selectedBidAmountCents, suggestedBidAmountCents]);

  useEffect(() => {
    if (!isBidComposerOpen) return;

    const targetIndex = getClosestWheelIndex(wheelOptions, activeBidAmountCents);
    requestAnimationFrame(() => {
      wheelRef.current?.scrollTo({
        y: targetIndex * WHEEL_ITEM_HEIGHT,
        animated: false,
      });
    });
  }, [activeBidAmountCents, isBidComposerOpen, wheelOptions]);

  const handleWheelEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / WHEEL_ITEM_HEIGHT);
    const nextIndex = Math.min(wheelOptions.length - 1, Math.max(0, rawIndex));
    setSelectedBidAmountCents(wheelOptions[nextIndex]);
    setSubmissionError(null);
  };

  const handleSelectAmount = (amountCents: number) => {
    setSelectedBidAmountCents(clampBidAmount(amountCents, maxFareCents ?? undefined));
    setSubmissionError(null);
  };

  const nudgeBidAmount = (deltaCents: number) => {
    setSelectedBidAmountCents(
      clampBidAmount(activeBidAmountCents + deltaCents, maxFareCents ?? undefined),
    );
    setSubmissionError(null);
  };

  const handleSubmitBid = async () => {
    setSubmissionError(null);
    try {
      await onSubmitBid({
        amountCents: activeBidAmountCents,
        note: noteText.trim() ? noteText.trim() : null,
      });
      setIsBidComposerOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to place bid right now.";
      setSubmissionError(message);
    }
  };

  return {
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
    selectedBidAmountCents,
    setIsBidComposerOpen,
    setIsNoteOpen,
    setNoteText,
    setSubmissionError,
    setSelectedBidAmountCents,
    submissionError,
    suggestedBidAmountCents,
    wheelOptions,
    wheelRef,
    wheelStepCents: WHEEL_STEP_CENTS,
  };
}
