import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
  ScheduleDateTimeSection,
} from "../components";
import { useEntryLoading } from "../lib/useEntryLoading";
import { RIDE_ASSET_MODULES } from "../constants/rideOptions";
import type { PlaceSuggestion } from "../lib/places/types";
import type { RideType, Screen } from "./types";

type ScheduleScreenProps = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  rideType: RideType;
  scheduleDate: Date;
  onPickupChange: (v: string) => void;
  onPickupSelectSuggestion?: (s: PlaceSuggestion) => void;
  onDropoffChange: (v: string) => void;
  onDropoffSelectSuggestion?: (s: PlaceSuggestion) => void;
  onRideTypeChange: (v: RideType) => void;
  onScheduleDateChange: (d: Date) => void;
  onFindRides: () => void;
  isSubmitting?: boolean;
  onNavigate: (screen: Screen) => void;
};

export function ScheduleScreen({
  pickup,
  pickupPlaceholder,
  dropoff,
  rideType,
  scheduleDate,
  onPickupChange,
  onPickupSelectSuggestion,
  onDropoffChange,
  onDropoffSelectSuggestion,
  onRideTypeChange,
  onScheduleDateChange,
  onFindRides,
  isSubmitting = false,
  onNavigate,
}: ScheduleScreenProps) {
  const isRideTypeLoading = useEntryLoading({
    assetModules: RIDE_ASSET_MODULES,
  });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <KeyboardDoneAccessory nativeID="schedule-keyboard-done" />
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="px-5 pt-6">
              <BackTitleHeader title="Schedule ride" onBack={() => onNavigate("home")} />

              <LocationSection
                pickup={pickup}
                pickupPlaceholder={pickupPlaceholder}
                dropoff={dropoff}
                onPickupChange={onPickupChange}
                onPickupSelectSuggestion={onPickupSelectSuggestion}
                onDropoffChange={onDropoffChange}
                onDropoffSelectSuggestion={onDropoffSelectSuggestion}
                inputAccessoryViewID="schedule-keyboard-done"
              />

              <ScheduleDateTimeSection
                scheduleDate={scheduleDate}
                onScheduleDateChange={onScheduleDateChange}
              />

              <RideTypeSection
                rideType={rideType}
                onRideTypeChange={onRideTypeChange}
                isLoading={isRideTypeLoading}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {!isKeyboardVisible ? (
          <BottomActionButton
            label={isSubmitting ? "Scheduling..." : "Schedule ride"}
            onPress={onFindRides}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
