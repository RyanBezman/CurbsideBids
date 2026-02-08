import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LocationInput, RideTypeCard } from "../components";
import { useEntryLoading } from "../lib/useEntryLoading";
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
const RIDE_ASSET_MODULES = RIDE_OPTIONS.map(({ source }) => source as number);

type Props = {
  pickup: string;
  pickupPlaceholder?: string;
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
  pickupPlaceholder,
  dropoff,
  rideType,
  onPickupChange,
  onDropoffChange,
  onRideTypeChange,
  onFindRides,
  onNavigate,
}: Props) {
  const isRideTypeLoading = useEntryLoading({
    assetModules: RIDE_ASSET_MODULES,
  });

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

            <LocationInput
              variant="pickup"
              value={pickup}
              placeholder={pickupPlaceholder}
              onChangeText={onPickupChange}
            />
            <LocationInput
              variant="dropoff"
              value={dropoff}
              onChangeText={onDropoffChange}
            />

            <Text className="text-neutral-400 text-sm mb-2 ml-1">
              Ride type
            </Text>
            <View className="gap-2">
              {isRideTypeLoading
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
