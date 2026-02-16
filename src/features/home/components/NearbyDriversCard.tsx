import { Text, View } from "react-native";

export function NearbyDriversCard() {
  return (
    <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
      <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
      <Text className="text-neutral-400 text-sm flex-1">
        <Text className="text-white font-semibold">247</Text> drivers nearby
      </Text>
      <Text className="text-violet-400 text-sm font-medium">~3 min pickup</Text>
    </View>
  );
}
