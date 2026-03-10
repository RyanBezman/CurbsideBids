import { Animated, Text, View } from "react-native";
import type { ReservationRecord } from "@domain/reservations";

const TIMELINE_STEPS = ["Requested", "Accepted", "Active", "Completed"] as const;

export function getTimelineStepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "bid_selected" || status === "accepted") return 1;
  if (status === "driver_en_route" || status === "picked_up") return 2;
  if (status === "completed") return 3;
  return 0;
}

export function getLiveStatusLabel(reservation: ReservationRecord): string {
  if (reservation.status === "pending") {
    return reservation.activeBidCount > 0 ? "Offers Ready" : "Waiting for bids";
  }

  return TIMELINE_STEPS[getTimelineStepIndex(reservation.status)] ?? TIMELINE_STEPS[0];
}

type LiveBadgeProps = {
  pulse: Animated.Value;
};

export function LiveBadge({ pulse }: LiveBadgeProps) {
  return (
    <View className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5">
      <View className="flex-row items-center gap-1.5">
        <Animated.View
          style={{
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
            transform: [
              { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }) },
            ],
          }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-300"
        />
        <Text className="text-[10px] font-semibold tracking-wide text-emerald-200">LIVE</Text>
      </View>
    </View>
  );
}

type TimelineProgressProps = {
  currentStep: number;
  stepLabel: string;
};

export function TimelineProgress({
  currentStep,
  stepLabel,
}: TimelineProgressProps) {
  const progressPercent = ((currentStep + 1) / TIMELINE_STEPS.length) * 100;

  return (
    <>
      <View className="mt-3 w-full self-center">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-neutral-200">{stepLabel}</Text>
          <Text className="text-xs text-neutral-500">{`Step ${currentStep + 1} of ${TIMELINE_STEPS.length}`}</Text>
        </View>
      </View>

      <View className="mt-4 w-full self-center">
        <View className="relative h-3.5 w-full justify-center">
          <View className="absolute left-0 right-0 h-[2px] rounded-full bg-neutral-700" />
          <View
            className="absolute left-0 h-[2px] rounded-full bg-violet-500"
            style={{ width: `${progressPercent}%` }}
          />
          <View className="flex-row items-center justify-between">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <View
                  key={step}
                  className={`h-3.5 w-3.5 rounded-full border ${
                    isCompleted
                      ? isCurrent
                        ? "border-violet-300 bg-violet-400"
                        : "border-violet-500 bg-violet-500"
                      : "border-neutral-700 bg-neutral-900"
                  }`}
                />
              );
            })}
          </View>
        </View>
      </View>
    </>
  );
}
