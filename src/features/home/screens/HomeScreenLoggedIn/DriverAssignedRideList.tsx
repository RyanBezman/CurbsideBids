import { Alert, Text, TouchableOpacity, View } from "react-native";
import {
  canCancelReservationStatus,
  formatBidAmount,
  type ReservationRecord,
} from "@domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import {
  ReservationRoutePreview,
  ReservationVehicleThumb,
} from "@shared/ui";
import { formatDatetime } from "@features/reservations/lib";

type DriverAssignedRideListProps = {
  cancelingReservationId: string | null;
  isCancelingReservation: boolean;
  onCancelReservation: (reservationId: string) => Promise<void>;
  reservations: ReservationRecord[];
};

function DriverAssignedRideCard({
  cancelingReservationId,
  isCancelingReservation,
  onCancelReservation,
  reservation,
}: {
  cancelingReservationId: string | null;
  isCancelingReservation: boolean;
  onCancelReservation: (reservationId: string) => Promise<void>;
  reservation: ReservationRecord;
}) {
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;
  const canCancelRide = canCancelReservationStatus(reservation.status);
  const isCancelingThisReservation =
    isCancelingReservation && cancelingReservationId === reservation.id;

  const handleConfirmCancelRide = () => {
    if (!canCancelRide || isCancelingThisReservation) return;

    Alert.alert("Cancel ride", "Are you sure you want to cancel this ride?", [
      { text: "Keep ride", style: "cancel" },
      {
        text: "Cancel ride",
        style: "destructive",
        onPress: () => {
          void onCancelReservation(reservation.id);
        },
      },
    ]);
  };

  return (
    <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <View className="flex-row items-center">
        <ReservationVehicleThumb source={rideImage} containerClassName="mr-3" />

        <View className="flex-1">
          <Text className="text-sm font-semibold text-white">{reservation.rideType}</Text>
          <Text className="mt-0.5 text-xs text-neutral-400">
            {formatDatetime(reservation.scheduledAt, reservation.pickupLocation?.timeZone)}
          </Text>
          {reservation.agreedFareCents !== null ? (
            <Text className="mt-1 text-xs font-medium text-emerald-300">
              Fare {formatBidAmount(reservation.agreedFareCents)}
            </Text>
          ) : null}
        </View>

        {canCancelRide ? (
          <TouchableOpacity
            onPress={handleConfirmCancelRide}
            activeOpacity={0.7}
            disabled={isCancelingThisReservation}
            className="ml-3 rounded-full border border-rose-400/35 bg-rose-500/15 px-3 py-1.5"
          >
            <Text className="text-xs font-medium text-rose-200">
              {isCancelingThisReservation ? "Canceling..." : "Cancel ride"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ReservationRoutePreview
        pickupLabel={reservation.pickupLabel}
        dropoffLabel={reservation.dropoffLabel}
        containerClassName="mt-3 ml-1"
      />
    </View>
  );
}

export function DriverAssignedRideList({
  cancelingReservationId,
  isCancelingReservation,
  onCancelReservation,
  reservations,
}: DriverAssignedRideListProps) {
  if (reservations.length === 0) {
    return (
      <View className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-5">
        <Text className="text-center text-sm text-neutral-400">No assigned rides yet.</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {reservations.map((reservation) => (
        <DriverAssignedRideCard
          key={reservation.id}
          reservation={reservation}
          cancelingReservationId={cancelingReservationId}
          isCancelingReservation={isCancelingReservation}
          onCancelReservation={onCancelReservation}
        />
      ))}
    </View>
  );
}
