import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ReservationRecord } from "../../../domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "../../../domain/ride";
import { formatDatetime } from "../../reservations";

const TIMELINE_STEPS = [
  "Requested",
  "Confirmed",
  "Driver en route",
  "Picked up",
  "Completed",
] as const;

function getTimelineStepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "accepted") return 1;
  if (status === "driver_en_route") return 2;
  if (status === "picked_up") return 3;
  if (status === "completed") return 4;
  if (status === "canceled") return 0;
  return 0;
}

type ReservationProgressTimelineProps = {
  reservation: ReservationRecord;
  isCancelingReservation: boolean;
  onCancelReservation: (reservationId: string) => Promise<void>;
};

export function ReservationProgressTimeline({
  reservation,
  isCancelingReservation,
  onCancelReservation,
}: ReservationProgressTimelineProps) {
  if (reservation.status === "canceled") {
    return null;
  }

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const currentStep = getTimelineStepIndex(reservation.status);
  // Count the active step itself so "Requested" shows visible progress.
  const progressPercent = ((currentStep + 1) / TIMELINE_STEPS.length) * 100;
  const stepLabel = TIMELINE_STEPS[currentStep] ?? TIMELINE_STEPS[0];
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;
  const canCancelRide =
    reservation.status === "pending" || reservation.status === "accepted";

  const handleOpenManageActions = () => {
    if (!canCancelRide || isCancelingReservation) return;

    Alert.alert("Manage ride", "Choose an action for this ride.", [
      { text: "Close", style: "cancel" },
      {
        text: "Cancel ride",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await onCancelReservation(reservation.id);
              Alert.alert("Ride canceled", "This reservation has been canceled.");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Unable to cancel this ride right now.";
              Alert.alert("Cancel failed", message);
            }
          })();
        },
      },
    ]);
  };

  return (
    <View className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <View className="flex-row items-center gap-2">
        <Text className="text-base font-semibold text-white">Ride Status</Text>
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
      </View>

      <View className="mt-3 w-full self-center">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-neutral-200">{stepLabel}</Text>
          <Text className="text-xs text-neutral-500">{`Step ${currentStep + 1} of ${TIMELINE_STEPS.length}`}</Text>
        </View>
        <View className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <View
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${progressPercent}%` }}
          />
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

      <View className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-xs uppercase tracking-wide text-neutral-500">Route</Text>
            <Text className="mt-1 text-xs text-neutral-300" numberOfLines={1}>
              {reservation.pickupLabel}
            </Text>
            <Text className="mt-0.5 text-xs text-neutral-500" numberOfLines={1}>
              {reservation.dropoffLabel}
            </Text>
            <Text className="mt-2 text-xs text-neutral-500">
              Scheduled for {formatDatetime(reservation.scheduledAt)}
            </Text>
          </View>
          {rideImage ? (
            <View className="h-16 w-24 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 p-1.5">
              <Image source={rideImage} className="h-full w-full" resizeMode="contain" />
            </View>
          ) : null}
        </View>
      </View>

      {canCancelRide ? (
        <View className="mt-2 flex-row items-center justify-between px-1">
          <Text className="text-xs text-neutral-500">Need to change this ride?</Text>
          <TouchableOpacity
            onPress={handleOpenManageActions}
            disabled={isCancelingReservation}
            activeOpacity={0.7}
            className="px-1 py-0.5"
          >
            {isCancelingReservation ? (
              <View className="flex-row items-center gap-1.5">
                <ActivityIndicator color="#a3a3a3" size="small" />
                <Text className="text-xs font-medium text-neutral-300">Canceling...</Text>
              </View>
            ) : (
              <Text className="text-xs font-medium text-neutral-300">Manage</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
