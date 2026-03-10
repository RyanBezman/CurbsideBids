import { Text, TouchableOpacity, View } from "react-native";
import type { AppRouteName } from "@app/navigation";

type TripSearchCardProps = {
  onNavigate: (route: AppRouteName) => void;
};

export function TripSearchCard({ onNavigate }: TripSearchCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onNavigate("whereTo")}
      className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800"
      activeOpacity={0.8}
    >
      <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
      <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
      <Text className="text-violet-400">→</Text>
    </TouchableOpacity>
  );
}
