import { Text, TouchableOpacity, View } from "react-native";
import {
  clampBidAmount,
  formatBidAmount,
  getFareGuidanceCents,
  WHEEL_STEP_CENTS,
} from "../../../domain";

type MaxFareSectionProps = {
  estimatedTripMiles: number | null;
  estimatedTripMinutes: number | null;
  maxFareCents: number;
  onMaxFareChange: (value: number) => void;
};

function getBudgetOptions(
  rangeMinCents: number,
  defaultMaxFareCents: number,
  rangeMaxCents: number,
): number[] {
  return Array.from(
    new Set([rangeMinCents, defaultMaxFareCents, rangeMaxCents]),
  ).sort((left, right) => left - right);
}

export function MaxFareSection({
  estimatedTripMiles,
  estimatedTripMinutes,
  maxFareCents,
  onMaxFareChange,
}: MaxFareSectionProps) {
  const fareGuidance = getFareGuidanceCents(estimatedTripMiles, estimatedTripMinutes);
  const budgetOptions = getBudgetOptions(
    fareGuidance.rangeMinCents,
    fareGuidance.defaultMaxFareCents,
    fareGuidance.rangeMaxCents,
  );

  return (
    <>
      <Text className="text-neutral-400 text-sm mb-2 ml-1 mt-5">Max budget</Text>
      <View className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-white text-2xl font-semibold">
              {formatBidAmount(maxFareCents)}
            </Text>
            <Text className="text-neutral-400 text-xs mt-1">
              Typical fare {formatBidAmount(fareGuidance.rangeMinCents)} -{" "}
              {formatBidAmount(fareGuidance.rangeMaxCents)}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                onMaxFareChange(clampBidAmount(maxFareCents - WHEEL_STEP_CENTS))
              }
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2"
            >
              <Text className="text-neutral-200 text-sm font-medium">- $1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onMaxFareChange(maxFareCents + WHEEL_STEP_CENTS)}
              className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2"
            >
              <Text className="text-neutral-200 text-sm font-medium">+ $1</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {budgetOptions.map((amountCents) => {
            const isSelected = amountCents === maxFareCents;
            return (
              <TouchableOpacity
                key={amountCents}
                activeOpacity={0.85}
                onPress={() => onMaxFareChange(amountCents)}
                className={`rounded-full border px-3 py-1.5 ${
                  isSelected
                    ? "border-emerald-500/70 bg-emerald-500/15"
                    : "border-neutral-700 bg-neutral-950"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? "text-emerald-200" : "text-neutral-300"
                  }`}
                >
                  {formatBidAmount(amountCents)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-neutral-500 text-xs mt-3">
          Drivers can bid at or below this amount. Raise it if you are not getting
          enough offers.
        </Text>
      </View>
    </>
  );
}
