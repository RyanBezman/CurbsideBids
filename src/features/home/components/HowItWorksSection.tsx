import { Text, View } from "react-native";

export function HowItWorksSection() {
  return (
    <>
      <Text className="text-white text-lg font-semibold mb-4">How it works</Text>

      <View className="gap-4 mb-6">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
            <Text className="text-violet-400 text-xs font-bold">1</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Enter destination</Text>
            <Text className="text-neutral-500 text-sm">Tell us where you're going</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
            <Text className="text-violet-400 text-xs font-bold">2</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Get live bids</Text>
            <Text className="text-neutral-500 text-sm">Drivers compete for your ride</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
            <Text className="text-violet-400 text-xs font-bold">3</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Choose & go</Text>
            <Text className="text-neutral-500 text-sm">Pick the best price, ride in minutes</Text>
          </View>
        </View>
      </View>
    </>
  );
}
