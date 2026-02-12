import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import type { ReservationRecord } from "../../screens/types";
import { RIDE_OPTION_BY_TYPE } from "../../constants/rideOptions";
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
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;

  return (
    <TouchableOpacity
      onPress={() => onSelectReservation(reservation.id)}
      activeOpacity={0.7}
      className="rounded-2xl p-4 border bg-neutral-900 border-neutral-800"
    >
      {/* Top row: image + info + status badge */}
      <View className="flex-row items-center">
        {/* Vehicle thumbnail */}
        {rideImage ? (
          <View
            className="mr-3 h-12 w-16 items-center justify-center rounded-xl bg-neutral-800"
          >
            <Image source={rideImage} className="h-8 w-14" resizeMode="contain" />
          </View>
        ) : null}

        {/* Ride type + scheduled time */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">
            {reservation.rideType}
          </Text>
          <Text className="text-neutral-400 text-xs mt-0.5">
            {formatDatetime(reservation.scheduledAt)}
          </Text>
        </View>

        {/* Status chip */}
        <View className={`rounded-full border px-2.5 py-1 ${statusClasses.chip}`}>
          <Text className={`text-xs font-medium ${statusClasses.text}`}>
            {formatStatusLabel(reservation.status)}
          </Text>
        </View>
      </View>

      {/* Route: pickup → dropoff */}
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
        {/* Chevron */}
        <Text className="text-neutral-600 text-sm ml-2">›</Text>
      </View>

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
