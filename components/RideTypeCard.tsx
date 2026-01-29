import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import type { RideType } from "../screens/types";

type Props = {
  type: RideType;
  source: ImageSourcePropType;
  minsAway: string;
  arrival: string;
  selected: boolean;
  onSelect: () => void;
};

export function RideTypeCard({
  type,
  source,
  minsAway,
  arrival,
  selected,
  onSelect,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      className={`flex-row items-center rounded-2xl overflow-hidden border ${
        selected
          ? "bg-violet-600/20 border-violet-500"
          : "bg-neutral-900 border-neutral-800"
      }`}
    >
      <Image
        source={source}
        className="w-32 h-24 bg-neutral-800"
        resizeMode="contain"
      />
      <View className="flex-1 ml-4">
        <Text
          className={`font-semibold text-base ${
            selected ? "text-white" : "text-neutral-200"
          }`}
        >
          {type}
        </Text>
        <Text className="text-neutral-500 text-sm mt-0.5">{minsAway}</Text>
        <Text className="text-neutral-500 text-sm">{arrival}</Text>
      </View>
      {selected ? (
        <View className="w-6 h-6 rounded-full bg-violet-500 items-center justify-center mr-4">
          <Text className="text-white text-xs">✓</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
