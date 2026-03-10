import { useMemo } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { estimateTripDurationMinutes } from "@domain/location";
import type { ReservationRecord } from "@domain/reservations";
import { PendingReservationCard } from "@features/home/components";
import { useDriverReservationBids } from "./useDriverReservationBids";

type DriverHomeSectionProps = {
  recentReservations: ReservationRecord[];
  userId: string;
  isLoadingRecentReservations: boolean;
  isSyncingNewPendingReservation: boolean;
};

function DriverStats({ pendingCount }: { pendingCount: number }) {
  return (
    <View className="flex-row gap-3 mb-8">
      <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
        <Text className="text-xl mb-1">🚘</Text>
        <Text className="font-semibold text-sm text-neutral-300">Availability</Text>
        <Text className="text-xs text-neutral-500 mt-1">Offline</Text>
      </View>
      <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
        <Text className="text-xl mb-1">📋</Text>
        <Text className="font-semibold text-sm text-neutral-300">Requests</Text>
        <Text className="text-xs text-neutral-500 mt-1">{pendingCount} pending</Text>
      </View>
    </View>
  );
}

function EmptyPendingList({ isLoading }: { isLoading: boolean }) {
  return (
    <View className="bg-neutral-900 rounded-2xl px-5 py-5 border border-neutral-800">
      <Text className="text-neutral-400 text-sm text-center">
        {isLoading ? "Loading pending rides..." : "No pending reservation rides right now."}
      </Text>
    </View>
  );
}

export function DriverHomeSection({
  isLoadingRecentReservations,
  isSyncingNewPendingReservation,
  recentReservations,
  userId,
}: DriverHomeSectionProps) {
  const reservationIds = useMemo(
    () => recentReservations.map((reservation) => reservation.id),
    [recentReservations],
  );
  const {
    driverBidsByReservationId,
    isLoadingDriverBids,
    submittingBidReservationId,
    submitBidForReservation,
  } = useDriverReservationBids({
    isDriver: true,
    reservationIds,
    userId,
  });

  return (
    <>
      <DriverStats pendingCount={recentReservations.length} />

      <Text className="text-white text-lg font-semibold mb-4">Pending Reservation Rides</Text>
      {isSyncingNewPendingReservation ? (
        <View className="flex-row items-center gap-2 mb-3">
          <ActivityIndicator size="small" color="#a3a3a3" />
          <Text className="text-xs text-neutral-400">Adding new request...</Text>
        </View>
      ) : null}

      <View className="mb-8">
        {isLoadingRecentReservations && recentReservations.length === 0 ? (
          <EmptyPendingList isLoading />
        ) : recentReservations.length === 0 ? (
          <EmptyPendingList isLoading={false} />
        ) : (
          <View className="gap-3">
            {recentReservations.map((reservation) => {
              const existingBid = driverBidsByReservationId[reservation.id] ?? null;
              const isSubmittingBid = submittingBidReservationId === reservation.id;
              const estimatedTripMinutes = estimateTripDurationMinutes(
                reservation.pickupLocation,
                reservation.dropoffLocation,
              );

              return (
                <PendingReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  estimatedTripMinutes={estimatedTripMinutes}
                  existingBidAmountCents={existingBid?.amountCents ?? null}
                  existingBidNote={existingBid?.note ?? null}
                  isLoadingExistingBid={isLoadingDriverBids}
                  isSubmittingBid={isSubmittingBid}
                  onSubmitBid={async (input) => {
                    const isUpdatingBid = existingBid !== null;
                    await submitBidForReservation({
                      reservation,
                      estimatedTripMinutes,
                      input,
                    });

                    Alert.alert(
                      isUpdatingBid ? "Bid updated" : "Bid submitted",
                      isUpdatingBid
                        ? "Your latest price has been saved for this ride."
                        : "Your bid is now visible to the rider.",
                    );
                  }}
                />
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}
