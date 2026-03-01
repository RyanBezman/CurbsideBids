import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import type { ReservationRecord } from "../../../domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "../../../domain/ride";
import { formatDatetime } from "../../reservations";

type PendingReservationCardProps = {
  reservation: ReservationRecord;
  estimatedTripMinutes: number | null;
  isAccepting: boolean;
  isAccepted: boolean;
  onAccept: () => void;
};

export function PendingReservationCard({
  reservation,
  estimatedTripMinutes,
  isAccepting,
  isAccepted,
  onAccept,
}: PendingReservationCardProps) {
  const rideImage = RIDE_OPTION_BY_TYPE[reservation.rideType]?.source;

  return (
    <View className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800">
      {/* Top row: image + info + ETA badge */}
      <View className="flex-row items-center">
        {rideImage ? (
          <View className="mr-3 h-12 w-16 items-center justify-center rounded-xl bg-neutral-800">
            <Image source={rideImage} className="h-8 w-14" resizeMode="contain" />
          </View>
        ) : null}

        <View className="flex-1">
          <Text className="text-white font-semibold text-sm">
            {reservation.rideType}
          </Text>
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
      </View>

      {/* Accept button */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isAccepting || isAccepted}
        onPress={onAccept}
        className={`mt-3 rounded-xl py-2.5 items-center ${
          isAccepted ? "bg-emerald-800 border border-emerald-700" : "bg-emerald-600"
        }`}
      >
        {isAccepting ? (
          <ActivityIndicator color="#f8fafc" size="small" />
        ) : (
          <Text className="text-white text-sm font-semibold">
            {isAccepted ? "Accepted" : "Accept"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
