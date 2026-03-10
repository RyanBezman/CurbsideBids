import { Text, TouchableOpacity, View } from "react-native";
import type { AppRouteName } from "@app/navigation";

type QuickActionRowProps = {
  onNavigate: (route: AppRouteName) => void;
};

export function QuickActionRow({ onNavigate }: QuickActionRowProps) {
  return (
    <View className="flex-row gap-3 mb-8">
      <TouchableOpacity
        onPress={() => {
          onNavigate("whereTo");
        }}
        activeOpacity={0.8}
        className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-900 py-5 items-center"
      >
        <Text className="text-xl mb-1">🚗</Text>
        <Text className="font-semibold text-sm text-neutral-300">Ride</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onNavigate("package");
        }}
        activeOpacity={0.8}
        className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-900 py-5 items-center"
      >
        <Text className="text-xl mb-1">📦</Text>
        <Text className="font-semibold text-sm text-neutral-300">Package</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onNavigate("schedule");
        }}
        activeOpacity={0.8}
        className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-900 py-5 items-center"
      >
        <Text className="text-xl mb-1">📅</Text>
        <Text className="font-semibold text-sm text-neutral-300">Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}
