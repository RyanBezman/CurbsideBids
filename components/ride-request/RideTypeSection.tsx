import { Text, View } from "react-native";
import { RideTypeCard } from "../ui";
import { RIDE_OPTIONS } from "../../constants/rideOptions";
import type { RideType } from "../../screens/types";

type Props = {
  rideType: RideType;
  onRideTypeChange: (value: RideType) => void;
  isLoading: boolean;
};

export function RideTypeSection({ rideType, onRideTypeChange, isLoading }: Props) {
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
