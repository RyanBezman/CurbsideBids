import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { ReservationRecord } from "@domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import {
  ReservationRoutePreview,
  ReservationStatusChip,
  ReservationVehicleThumb,
} from "@shared/ui";
import { formatDatetime } from "@features/reservations/lib";

type RecentActivityListProps = {
  reservations: ReservationRecord[];
  isLoading: boolean;
  onSelectReservation: (reservationId: string) => void;
};

type RecentActivityCardProps = {
  reservation: ReservationRecord;
  onSelectReservation: (reservationId: string) => void;
};

function RecentActivityCard({ reservation, onSelectReservation }: RecentActivityCardProps) {
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;

  return (
    <TouchableOpacity
      onPress={() => onSelectReservation(reservation.id)}
      activeOpacity={0.7}
      className="rounded-2xl p-4 border bg-neutral-900 border-neutral-800"
    >
      <View className="flex-row items-center">
        <ReservationVehicleThumb source={rideImage} containerClassName="mr-3" />

        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">{reservation.rideType}</Text>
          <Text className="text-neutral-400 text-xs mt-0.5">
            {formatDatetime(reservation.scheduledAt)}
          </Text>
        </View>

        <ReservationStatusChip status={reservation.status} />
      </View>

      <ReservationRoutePreview
        pickupLabel={reservation.pickupLabel}
        dropoffLabel={reservation.dropoffLabel}
        containerClassName="mt-3 ml-1"
      />

      <Text className="text-neutral-600 text-sm ml-auto">›</Text>
    </TouchableOpacity>
  );
}

export function RecentActivityList({
  reservations,
  isLoading,
  onSelectReservation,
}: RecentActivityListProps) {
  if (isLoading) {
    return (
      <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 items-center">
        <ActivityIndicator color="#a78bfa" />
        <Text className="text-neutral-400 text-sm mt-3">Loading activity...</Text>
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
        <Text className="text-neutral-500 text-sm text-center">No recent rides yet</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {reservations.map((reservation) => (
        <RecentActivityCard
          key={reservation.id}
          reservation={reservation}
          onSelectReservation={onSelectReservation}
        />
      ))}
    </View>
  );
}
