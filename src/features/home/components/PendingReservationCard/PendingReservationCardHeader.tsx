import { Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { ReservationVehicleThumb } from "@shared/ui";
import { formatDatetime } from "@features/reservations/lib";

type PendingReservationCardHeaderProps = {
  rideType: string;
  scheduledAt: string;
  scheduledTimeZone?: string;
  estimatedTripMinutes: number | null;
  rideImage: ImageSourcePropType | null;
};

export function PendingReservationCardHeader({
  rideType,
  scheduledAt,
  scheduledTimeZone,
  estimatedTripMinutes,
  rideImage,
}: PendingReservationCardHeaderProps) {
  return (
    <View className="flex-row items-center">
      <ReservationVehicleThumb source={rideImage} containerClassName="mr-3" />

      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">{rideType}</Text>
        <Text className="text-neutral-400 text-xs mt-0.5">
          {formatDatetime(scheduledAt, scheduledTimeZone)}
        </Text>
      </View>

      <View className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
        <Text className="text-neutral-300 text-xs">
          {estimatedTripMinutes === null ? "N/A" : `~${estimatedTripMinutes} min`}
        </Text>
      </View>
    </View>
  );
}
