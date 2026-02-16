import { Text, View } from "react-native";
import type { RideType } from "../../../domain/ride";
import { RIDE_OPTIONS } from "../../../domain/ride";
import { RideTypeCard } from "../../../shared/ui";

type RideTypeSectionProps = {
  rideType: RideType;
  onRideTypeChange: (value: RideType) => void;
  isLoading: boolean;
};

export function RideTypeSection({
  rideType,
  onRideTypeChange,
  isLoading,
}: RideTypeSectionProps) {
  return (
    <>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">Ride type</Text>
      <View className="gap-2">
        {isLoading
          ? RIDE_OPTIONS.map(({ type, source }) => (
              <RideTypeCard
                key={`${type}-skeleton`}
                type={type}
                source={source}
                minsAway=""
                arrival=""
                selected={false}
                onSelect={() => {}}
                loading
              />
            ))
          : RIDE_OPTIONS.map(({ type, source, minsAway, arrival }) => (
              <RideTypeCard
                key={type}
                type={type}
                source={source}
                minsAway={minsAway}
                arrival={arrival}
                selected={rideType === type}
                onSelect={() => onRideTypeChange(type)}
              />
            ))}
      </View>
    </>
  );
}
