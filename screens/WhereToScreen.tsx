import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  BottomActionButton,
  BackTitleHeader,
  LocationInput,
  RideTypeCard,
} from "../components";
import { useEntryLoading } from "../lib/useEntryLoading";
import type { Screen, RideType } from "./types";
import { RIDE_ASSET_MODULES, RIDE_OPTIONS } from "./rideOptions";

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
            <BackTitleHeader title="Where to?" onBack={() => onNavigate("home")} />

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

        <BottomActionButton label="Find rides" onPress={onFindRides} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
