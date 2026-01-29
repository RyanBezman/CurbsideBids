import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import type { Screen, RideType } from "./types";

const RIDE_OPTIONS = [
  {
    type: "Economy" as const,
    source: require("../graphics/economy-graphic.png"),
    minsAway: "3 min away",
    arrival: "Arrives ~2:24 PM",
  },
  {
    type: "XL" as const,
    source: require("../graphics/xl-graphic.png"),
    minsAway: "5 min away",
    arrival: "Arrives ~2:26 PM",
  },
  {
    type: "Luxury" as const,
    source: require("../graphics/lux-sedan-graphic.png"),
    minsAway: "7 min away",
    arrival: "Arrives ~2:28 PM",
  },
  {
    type: "Luxury SUV" as const,
    source: require("../graphics/lux-suv-graphic.png"),
    minsAway: "4 min away",
    arrival: "Arrives ~2:25 PM",
  },
] as const;

type Props = {
  pickup: string;
  dropoff: string;
  rideType: RideType;
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onRideTypeChange: (v: RideType) => void;
  onFindRides: () => void;
  onNavigate: (screen: Screen) => void;
};

export function WhereToScreen({
  pickup,
  dropoff,
  rideType,
  onPickupChange,
  onDropoffChange,
  onRideTypeChange,
  onFindRides,
  onNavigate,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-6">
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => onNavigate("home")}
                className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
              >
                <Text className="text-white text-lg">←</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white">Where to?</Text>
            </View>

            <View className="mb-4">
              <Text className="text-neutral-400 text-sm mb-2 ml-1">
                Pickup
              </Text>
              <View className="bg-neutral-900 rounded-2xl px-5 py-4 flex-row items-center border border-neutral-800">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-4" />
                <TextInput
                  value={pickup}
                  onChangeText={onPickupChange}
                  placeholder="Enter pickup location"
                  placeholderTextColor="#525252"
                  className="flex-1 text-white text-base py-1"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-neutral-400 text-sm mb-2 ml-1">
                Dropoff
              </Text>
              <View className="bg-neutral-900 rounded-2xl px-5 py-4 flex-row items-center border border-neutral-800">
                <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
                <TextInput
                  value={dropoff}
                  onChangeText={onDropoffChange}
                  placeholder="Enter destination"
                  placeholderTextColor="#525252"
                  className="flex-1 text-white text-base py-1"
                />
              </View>
            </View>

            <Text className="text-neutral-400 text-sm mb-2 ml-1">
              Ride type
            </Text>
            <View className="gap-2">
              {RIDE_OPTIONS.map(({ type, source, minsAway, arrival }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => onRideTypeChange(type)}
                  activeOpacity={0.8}
                  className={`flex-row items-center rounded-2xl overflow-hidden border ${
                    rideType === type
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
                        rideType === type ? "text-white" : "text-neutral-200"
                      }`}
                    >
                      {type}
                    </Text>
                    <Text className="text-neutral-500 text-sm mt-0.5">
                      {minsAway}
                    </Text>
                    <Text className="text-neutral-500 text-sm">
                      {arrival}
                    </Text>
                  </View>
                  {rideType === type ? (
                    <View className="w-6 h-6 rounded-full bg-violet-500 items-center justify-center mr-4">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-4 pt-2 border-t border-neutral-800 bg-neutral-950">
          <TouchableOpacity
            onPress={onFindRides}
            className="bg-violet-600 rounded-2xl py-4"
          >
            <Text className="text-white text-center text-base font-bold">
              Find rides
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
