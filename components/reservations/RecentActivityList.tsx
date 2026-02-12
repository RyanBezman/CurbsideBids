import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { ReservationRecord } from "../../screens/types";
import { formatDatetime, formatStatusLabel } from "../../helpers/reservations/reservationFormat";
import { getStatusClasses } from "../../helpers/reservations/statusStyles";

type Props = {
  reservations: ReservationRecord[];
  isLoading: boolean;
  onSelectReservation: (reservationId: string) => void;
};

type RecentActivityCardProps = {
  reservation: ReservationRecord;
  onSelectReservation: (reservationId: string) => void;
};

function RecentActivityCard({ reservation, onSelectReservation }: RecentActivityCardProps) {
  const statusClasses = getStatusClasses(reservation.status);

  return (
    <TouchableOpacity
      onPress={() => onSelectReservation(reservation.id)}
      activeOpacity={0.8}
      className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className={`w-2 h-2 rounded-full ${statusClasses.dot}`} />
          <Text className="text-white font-semibold text-sm">{reservation.rideType}</Text>
        </View>
        <View className={`px-2 py-1 rounded-full border ${statusClasses.chip}`}>
          <Text className={`text-xs font-medium ${statusClasses.text}`}>
            {formatStatusLabel(reservation.status)}
          </Text>
        </View>
      </View>

      <Text className="text-neutral-300 text-sm">{formatDatetime(reservation.scheduledAt)}</Text>
      <Text className="text-neutral-500 text-xs mt-1" numberOfLines={1}>
        {reservation.pickupLabel}
        {" -> "}
        {reservation.dropoffLabel}
      </Text>
    </TouchableOpacity>
  );
}

export function RecentActivityList({
  reservations,
  isLoading,
  onSelectReservation,
}: Props) {
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
    <View className="gap-2">
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
