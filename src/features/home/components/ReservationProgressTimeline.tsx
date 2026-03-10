import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import {
  canCancelReservationStatus,
  type ReservationRecord,
} from "@domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import { ReservationRoutePreview, ReservationVehicleThumb } from "@shared/ui";
import { formatActiveBidSummary, formatDatetime } from "@features/reservations/lib";
import {
  getLiveStatusLabel,
  getTimelineStepIndex,
  LiveBadge,
  TimelineProgress,
} from "./ReservationProgressTimelineParts";

type TripSummaryCardProps = {
  reservation: ReservationRecord;
};

function TripSummaryCard({ reservation }: TripSummaryCardProps) {
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;

  return (
    <View className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-wide text-neutral-500">Trip</Text>
          <ReservationRoutePreview
            pickupLabel={reservation.pickupLabel}
            dropoffLabel={reservation.dropoffLabel}
            containerClassName="mt-1 ml-1"
          />
          <Text className="mt-2 text-xs text-neutral-500">
            Scheduled for{" "}
            {formatDatetime(reservation.scheduledAt, reservation.pickupLocation?.timeZone)}
          </Text>
        </View>
        <ReservationVehicleThumb
          source={rideImage}
          containerClassName="h-16 w-24 rounded-lg border border-neutral-800 bg-neutral-900 p-1.5"
          imageClassName="h-full w-full"
        />
      </View>
    </View>
  );
}

type ReservationProgressTimelineProps = {
  reservation: ReservationRecord;
  isCancelingReservation: boolean;
  onCancelReservation: (reservationId: string) => Promise<void>;
  onOpenDetails: (reservationId: string) => void;
};

export function ReservationProgressTimeline({
  reservation,
  isCancelingReservation,
  onCancelReservation,
  onOpenDetails,
}: ReservationProgressTimelineProps) {
  if (reservation.status === "canceled") {
    return null;
  }

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const currentStep = getTimelineStepIndex(reservation.status);
  const canCancelRide = canCancelReservationStatus(reservation.status);
  const hasIncomingBids =
    reservation.status === "pending" && reservation.activeBidCount > 0;
  const liveStatusLabel = getLiveStatusLabel(reservation);

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
                error instanceof Error ? error.message : "Unable to cancel this ride right now.";
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
        <LiveBadge pulse={pulse} />
      </View>

      <TimelineProgress currentStep={currentStep} stepLabel={liveStatusLabel} />

      {hasIncomingBids ? (
        <View className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-3">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            Offers Ready
          </Text>
          <Text className="mt-1 text-sm text-emerald-50">
            {formatActiveBidSummary(reservation.activeBidCount)}. Open the ride to compare bids.
          </Text>
        </View>
      ) : null}

      <TripSummaryCard reservation={reservation} />

      <View className="mt-2 flex-row items-center justify-between px-1">
        <TouchableOpacity
          onPress={() => onOpenDetails(reservation.id)}
          activeOpacity={0.7}
          className={
            hasIncomingBids
              ? "rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1.5"
              : "px-1 py-0.5"
          }
        >
          <Text
            className={
              hasIncomingBids
                ? "text-xs font-semibold text-emerald-200"
                : "text-xs font-medium text-neutral-300"
            }
          >
            {hasIncomingBids ? "Review offers" : "View details"}
          </Text>
        </TouchableOpacity>

        {canCancelRide ? (
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
        ) : (
          <Text className="text-xs text-neutral-500">
            {reservation.status === "completed" ? "Ride complete" : "Tracking live"}
          </Text>
        )}
      </View>
    </View>
  );
}
