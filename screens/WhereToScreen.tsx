import { StatusBar } from "expo-status-bar";
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  BackTitleHeader,
  BottomActionButton,
  KeyboardDoneAccessory,
  LocationSection,
  RideTypeSection,
} from "../components";
import { useEntryLoading } from "../lib/useEntryLoading";
import { RIDE_ASSET_MODULES } from "../constants/rideOptions";
import type { PlaceSuggestion } from "../lib/places/types";
import type { RideType, Screen } from "./types";

type Props = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  rideType: RideType;
  onPickupChange: (v: string) => void;
  onPickupSelectSuggestion?: (s: PlaceSuggestion) => void;
  onDropoffChange: (v: string) => void;
  onDropoffSelectSuggestion?: (s: PlaceSuggestion) => void;
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
  onPickupSelectSuggestion,
  onDropoffChange,
  onDropoffSelectSuggestion,
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
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="px-5 pt-6">
              <BackTitleHeader title="Where to?" onBack={() => onNavigate("home")} />

              <LocationSection
                pickup={pickup}
                pickupPlaceholder={pickupPlaceholder}
                dropoff={dropoff}
                onPickupChange={onPickupChange}
                onPickupSelectSuggestion={onPickupSelectSuggestion}
                onDropoffChange={onDropoffChange}
                onDropoffSelectSuggestion={onDropoffSelectSuggestion}
                inputAccessoryViewID="whereto-keyboard-done"
              />

              <RideTypeSection
                rideType={rideType}
                onRideTypeChange={onRideTypeChange}
                isLoading={isRideTypeLoading}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        <KeyboardDoneAccessory nativeID="whereto-keyboard-done" />
        <BottomActionButton label="Find rides" onPress={onFindRides} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
