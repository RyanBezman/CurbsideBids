import { Text, TouchableOpacity, View } from "react-native";

type HomeTopBarProps = {
  onSignOut: () => void;
  subtitle: string;
};

export function HomeTopBar({ onSignOut, subtitle }: HomeTopBarProps) {
  return (
    <View className="flex-row items-center justify-between mb-8">
      <View>
        <Text className="text-3xl font-bold text-white tracking-tight">Curbside</Text>
        <Text className="text-sm text-neutral-500 mt-1">{subtitle}</Text>
      </View>
      <TouchableOpacity
        onPress={onSignOut}
        className="bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800"
      >
        <Text className="text-neutral-300 text-sm font-medium">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
