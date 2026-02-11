import { Text, TouchableOpacity, View } from "react-native";
import type { Screen } from "../../screens/types";
import type { QuickAction } from "./types";

type Props = {
  quickAction: QuickAction | null;
  onQuickActionChange: (next: QuickAction) => void;
  onNavigate: (screen: Screen) => void;
};

export function QuickActionRow({
  quickAction,
  onQuickActionChange,
  onNavigate,
}: Props) {
  return (
    <View className="flex-row gap-3 mb-8">
      <TouchableOpacity
        onPress={() => {
          onQuickActionChange("rides");
          onNavigate("whereto");
        }}
        activeOpacity={0.8}
        className={`flex-1 rounded-2xl py-5 items-center border ${
          quickAction === "rides"
            ? "bg-violet-600 border-violet-500"
            : "bg-neutral-900 border-neutral-800"
        }`}
      >
        <Text className="text-xl mb-1">🚗</Text>
        <Text
          className={`font-semibold text-sm ${
            quickAction === "rides" ? "text-white" : "text-neutral-300"
          }`}
        >
          Ride
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onQuickActionChange("package");
          onNavigate("package");
        }}
        activeOpacity={0.8}
        className={`flex-1 rounded-2xl py-5 items-center border ${
          quickAction === "package"
            ? "bg-violet-600 border-violet-500"
            : "bg-neutral-900 border-neutral-800"
        }`}
      >
        <Text className="text-xl mb-1">📦</Text>
        <Text
          className={`font-semibold text-sm ${
            quickAction === "package" ? "text-white" : "text-neutral-300"
          }`}
        >
          Package
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onQuickActionChange("scheduled");
          onNavigate("schedule");
        }}
        activeOpacity={0.8}
        className={`flex-1 rounded-2xl py-5 items-center border ${
          quickAction === "scheduled"
            ? "bg-violet-600 border-violet-500"
            : "bg-neutral-900 border-neutral-800"
        }`}
      >
        <Text className="text-xl mb-1">📅</Text>
        <Text
          className={`font-semibold text-sm ${
            quickAction === "scheduled" ? "text-white" : "text-neutral-300"
          }`}
        >
          Schedule
        </Text>
      </TouchableOpacity>
    </View>
  );
}
