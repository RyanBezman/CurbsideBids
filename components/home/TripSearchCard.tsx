import { Text, TouchableOpacity, View } from "react-native";
import type { Screen } from "../../screens/types";
import type { QuickAction } from "./types";

type Props = {
  quickAction: QuickAction | null;
  onNavigate: (screen: Screen) => void;
};

export function TripSearchCard({ quickAction, onNavigate }: Props) {
  return (
    <TouchableOpacity
      onPress={() => {
        if (quickAction === "package") onNavigate("package");
        else if (quickAction === "scheduled") onNavigate("schedule");
        else onNavigate("whereto");
      }}
      className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800"
      activeOpacity={0.8}
    >
      <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
      <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
      <Text className="text-violet-400">→</Text>
    </TouchableOpacity>
  );
}
