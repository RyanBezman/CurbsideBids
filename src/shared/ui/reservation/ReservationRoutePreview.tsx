import { Text, View } from "react-native";

type ReservationRoutePreviewProps = {
  pickupLabel: string;
  dropoffLabel: string;
  containerClassName?: string;
  pickupTextClassName?: string;
  dropoffTextClassName?: string;
  markersClassName?: string;
};

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function ReservationRoutePreview({
  pickupLabel,
  dropoffLabel,
  containerClassName,
  pickupTextClassName,
  dropoffTextClassName,
  markersClassName,
}: ReservationRoutePreviewProps) {
  return (
    <View className={joinClasses("flex-row items-center", containerClassName)}>
      <View className={joinClasses("items-center mr-2.5", markersClassName)}>
        <View className="h-2 w-2 rounded-full border-[1.5px] border-green-500 bg-green-500/30" />
        <View className="w-[1.5px] h-2.5 bg-neutral-700 my-0.5" />
        <View className="h-2 w-2 rounded-full border-[1.5px] border-violet-500 bg-violet-500/30" />
      </View>
      <View className="flex-1">
        <Text
          className={joinClasses("text-neutral-300 text-xs", pickupTextClassName)}
          numberOfLines={1}
        >
          {pickupLabel}
        </Text>
        <Text
          className={joinClasses("text-neutral-500 text-xs mt-1", dropoffTextClassName)}
          numberOfLines={1}
        >
          {dropoffLabel}
        </Text>
      </View>
    </View>
  );
}
