import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { estimateTripDistanceMiles } from "../../../domain/location";
import type { ReservationRecord } from "../../../domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "../../../domain/ride";
import { formatDatetime } from "../../reservations";

export type PendingReservationCardBidInput = {
  amountCents: number;
  note: string | null;
};

type PendingReservationCardProps = {
  reservation: ReservationRecord;
  estimatedTripMinutes: number | null;
  existingBidAmountCents: number | null;
  existingBidNote: string | null;
  isLoadingExistingBid: boolean;
  isSubmittingBid: boolean;
  onSubmitBid: (input: PendingReservationCardBidInput) => Promise<void>;
};

const MIN_BID_CENTS = 500;
const WHEEL_STEP_CENTS = 100;
const WHEEL_RANGE_STEPS = 24;
const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VIEWPORT_HEIGHT = 220;
const WHEEL_CENTER_OFFSET = (WHEEL_VIEWPORT_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

function formatBidAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function clampBidAmount(amountCents: number): number {
  return Math.max(MIN_BID_CENTS, amountCents);
}

function getSuggestedBidAmountCents(
  estimatedTripMiles: number | null,
  estimatedTripMinutes: number | null,
): number {
  if (estimatedTripMiles === null && estimatedTripMinutes === null) return 2200;

  const mileageCents = estimatedTripMiles === null ? 0 : Math.round(estimatedTripMiles * 100);
  const timeCents = estimatedTripMinutes === null ? 0 : estimatedTripMinutes * 50;
  const roundedToDollar = Math.round((mileageCents + timeCents) / 100) * 100;

  return clampBidAmount(roundedToDollar);
}

function buildBidWheelOptions(centerAmountCents: number): number[] {
  const start = clampBidAmount(centerAmountCents - WHEEL_RANGE_STEPS * WHEEL_STEP_CENTS);
  const out: number[] = [];

  for (let index = 0; index <= WHEEL_RANGE_STEPS * 2; index += 1) {
    out.push(start + index * WHEEL_STEP_CENTS);
  }

  return out;
}

function getClosestWheelIndex(options: number[], amountCents: number): number {
  if (options.length === 0) return 0;

  let closestIndex = 0;
  let closestDelta = Number.POSITIVE_INFINITY;

  for (let index = 0; index < options.length; index += 1) {
    const delta = Math.abs(options[index] - amountCents);
    if (delta < closestDelta) {
      closestDelta = delta;
      closestIndex = index;
    }
  }

  return closestIndex;
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
  const hasExistingBid = existingBidAmountCents !== null;
  const [isBidComposerOpen, setIsBidComposerOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [selectedBidAmountCents, setSelectedBidAmountCents] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const wheelRef = useRef<ScrollView | null>(null);
  const estimatedTripMiles = useMemo(
    () => estimateTripDistanceMiles(reservation.pickupLocation, reservation.dropoffLocation),
    [reservation.dropoffLocation, reservation.pickupLocation],
  );
  const suggestedBidAmountCents = useMemo(
    () => getSuggestedBidAmountCents(estimatedTripMiles, estimatedTripMinutes),
    [estimatedTripMiles, estimatedTripMinutes],
  );
  const wheelCenterAmountCents = existingBidAmountCents ?? suggestedBidAmountCents;
  const wheelOptions = useMemo(
    () => buildBidWheelOptions(wheelCenterAmountCents),
    [wheelCenterAmountCents],
  );
  const activeBidAmountCents = selectedBidAmountCents ?? suggestedBidAmountCents;
  const activeBidIndex = useMemo(
    () => getClosestWheelIndex(wheelOptions, activeBidAmountCents),
    [activeBidAmountCents, wheelOptions],
  );
  const mileageComponentCents = estimatedTripMiles === null ? 0 : Math.round(estimatedTripMiles * 100);
  const timeComponentCents = estimatedTripMinutes === null ? 0 : estimatedTripMinutes * 50;
  const tripBreakdownLabel = useMemo(() => {
    const parts: string[] = [];
    if (estimatedTripMiles !== null) {
      parts.push(`~${estimatedTripMiles.toFixed(1)} mi`);
    }
    if (estimatedTripMinutes !== null) {
      parts.push(`~${estimatedTripMinutes} min`);
    }

    if (parts.length === 0) return "trip metrics unavailable";
    return parts.join(" • ");
  }, [estimatedTripMiles, estimatedTripMinutes]);

  useEffect(() => {
    if (existingBidAmountCents === null) return;

    setSelectedBidAmountCents(clampBidAmount(existingBidAmountCents));
    setNoteText(existingBidNote ?? "");
    setIsNoteOpen(Boolean(existingBidNote?.trim()));
  }, [existingBidAmountCents, existingBidNote]);

  useEffect(() => {
    if (!isBidComposerOpen) return;
    if (selectedBidAmountCents !== null) return;
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

  const nudgeBidAmount = (deltaCents: number) => {
    setSelectedBidAmountCents(clampBidAmount(activeBidAmountCents + deltaCents));
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

  return (
    <View className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
      <View className="flex-row items-center">
        {rideImage ? (
          <View className="mr-3 h-12 w-16 items-center justify-center rounded-xl bg-neutral-800">
            <Image source={rideImage} className="h-8 w-14" resizeMode="contain" />
          </View>
        ) : null}

        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{reservation.rideType}</Text>
          <Text className="text-neutral-400 text-xs mt-0.5">
            {formatDatetime(reservation.scheduledAt)}
          </Text>
        </View>

        <View className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
          <Text className="text-neutral-300 text-xs">
            {estimatedTripMinutes === null ? "N/A" : `~${estimatedTripMinutes} min`}
          </Text>
        </View>
      </View>

      <View className="mt-3 ml-1 flex-row items-center">
        <View className="items-center mr-2.5">
          <View className="h-2 w-2 rounded-full border-[1.5px] border-green-500 bg-green-500/30" />
          <View className="w-[1.5px] h-2.5 bg-neutral-700 my-0.5" />
          <View className="h-2 w-2 rounded-full border-[1.5px] border-violet-500 bg-violet-500/30" />
        </View>
        <View className="flex-1">
          <Text className="text-neutral-300 text-xs" numberOfLines={1}>
            {reservation.pickupLabel}
          </Text>
          <Text className="text-neutral-500 text-xs mt-1" numberOfLines={1}>
            {reservation.dropoffLabel}
          </Text>
        </View>
      </View>

      {hasExistingBid ? (
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
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isLoadingExistingBid || isSubmittingBid}
        onPress={() => {
          setSubmissionError(null);
          setIsBidComposerOpen((prev) => !prev);
        }}
        className={`mt-3 rounded-xl py-2.5 items-center ${
          isBidComposerOpen
            ? "bg-neutral-800 border border-neutral-700"
            : "bg-emerald-600 border border-emerald-500/80"
        }`}
      >
        {isLoadingExistingBid ? (
          <ActivityIndicator color="#f8fafc" size="small" />
        ) : (
          <Text className="text-white text-sm font-semibold">
            {isBidComposerOpen ? "Close Bid Form" : hasExistingBid ? "Update Bid" : "Place Bid"}
          </Text>
        )}
      </TouchableOpacity>

      {isBidComposerOpen ? (
        <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-semibold">Set your bid</Text>
            <Text className="text-neutral-500 text-[11px]">Scroll wheel to adjust</Text>
          </View>

          <Text className="text-neutral-500 text-xs mt-1">
            Start estimate {formatBidAmount(suggestedBidAmountCents)} using $1/mi + $0.50/min.
          </Text>
          <Text className="text-neutral-600 text-[11px] mt-0.5">
            {tripBreakdownLabel} • {formatBidAmount(mileageComponentCents)} mileage +{" "}
            {formatBidAmount(timeComponentCents)} time
          </Text>

          <View className="mt-3 rounded-xl border border-neutral-700 bg-neutral-900 py-3">
            <Text className="text-center text-neutral-500 text-[10px] uppercase tracking-wide">
              Selected Bid
            </Text>
            <Text className="text-center text-white text-3xl font-semibold mt-1">
              {formatBidAmount(activeBidAmountCents)}
            </Text>

            <View className="mt-3 items-center">
              <View
                className="relative w-full max-w-[160px]"
                style={{ height: WHEEL_VIEWPORT_HEIGHT }}
              >
                <View
                  pointerEvents="none"
                  className="absolute left-0 right-0 rounded-xl border border-emerald-400/35 bg-emerald-500/10"
                  style={{
                    top: WHEEL_CENTER_OFFSET,
                    height: WHEEL_ITEM_HEIGHT,
                    zIndex: 2,
                  }}
                />
              <ScrollView
                ref={wheelRef}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                snapToInterval={WHEEL_ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleWheelEnd}
                contentContainerStyle={{
                  paddingTop: WHEEL_CENTER_OFFSET,
                  paddingBottom: WHEEL_CENTER_OFFSET,
                }}
              >
                {wheelOptions.map((wheelAmountCents, index) => {
                  const isSelected = index === activeBidIndex;

                  return (
                    <TouchableOpacity
                      key={wheelAmountCents}
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedBidAmountCents(wheelAmountCents);
                        setSubmissionError(null);
                        wheelRef.current?.scrollTo({
                          y: index * WHEEL_ITEM_HEIGHT,
                          animated: true,
                        });
                      }}
                      style={{ height: WHEEL_ITEM_HEIGHT }}
                      className="justify-center"
                    >
                      <View
                        className={`mx-2 rounded-lg border py-2 ${
                          isSelected
                            ? "bg-emerald-600/20 border-emerald-400/60"
                            : "bg-neutral-950 border-neutral-700"
                        }`}
                      >
                        <Text
                          className={`text-center text-sm font-semibold ${
                            isSelected ? "text-emerald-200" : "text-neutral-300"
                          }`}
                        >
                          {formatBidAmount(wheelAmountCents)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              </View>
            </View>

            <View className="mt-2 flex-row items-center justify-between px-2">
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmittingBid}
                onPress={() => nudgeBidAmount(-WHEEL_STEP_CENTS)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5"
              >
                <Text className="text-neutral-300 text-xs font-medium">- $1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmittingBid}
                onPress={() => nudgeBidAmount(WHEEL_STEP_CENTS)}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5"
              >
                <Text className="text-neutral-300 text-xs font-medium">+ $1</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSubmittingBid}
            onPress={() => setIsNoteOpen((prev) => !prev)}
            className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
          >
            <Text className="text-neutral-300 text-xs font-medium">
              {isNoteOpen ? "Hide note" : "Add note (optional)"}
            </Text>
          </TouchableOpacity>

          {isNoteOpen ? (
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Any details for the rider..."
              placeholderTextColor="#525252"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="mt-2 bg-neutral-900 rounded-xl px-4 py-3 text-white text-sm border border-neutral-800 min-h-[84px]"
              style={{ fontSize: 14 }}
            />
          ) : null}

          {submissionError ? (
            <Text className="text-rose-300 text-xs mt-2">{submissionError}</Text>
          ) : (
            <Text className="text-neutral-500 text-xs mt-2">
              Rider sees {formatBidAmount(activeBidAmountCents)}.
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSubmittingBid}
            onPress={() => {
              void handleSubmitBid();
            }}
            className={`mt-3 rounded-xl py-2.5 items-center ${
              isSubmittingBid
                ? "bg-neutral-700 border border-neutral-600"
                : "bg-emerald-600 border border-emerald-500/80"
            }`}
          >
            {isSubmittingBid ? (
              <ActivityIndicator color="#f8fafc" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">
                {hasExistingBid ? "Save Bid Update" : "Submit Bid"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
