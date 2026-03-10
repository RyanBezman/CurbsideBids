import { useEffect, useState } from "react";
import {
  View,
  Platform,
  Keyboard,
} from "react-native";
import type { AppRouteName } from "../../../app/navigation";
import type { PlaceSuggestion } from "../../../domain/location/placeSuggestion";
import type { RideType } from "../../../domain/ride";
import { RIDE_ASSET_MODULES } from "../../../domain/ride";
import {
  BackTitleHeader,
  BottomActionButton,
  KeyboardDoneAccessory,
  ScreenScaffold,
} from "../../../shared/ui";
import { useEntryLoading } from "../../../shared/lib";
import {
  MaxFareSection,
  LocationSection,
  RideTypeSection,
  ScheduleDateTimeSection,
} from "../components";

type ScheduleScreenProps = {
  pickup: string;
  pickupPlaceholder?: string;
  pickupTimeZone?: string;
  dropoff: string;
  estimatedTripMiles: number | null;
  estimatedTripMinutes: number | null;
  maxFareCents: number;
  rideType: RideType;
  scheduleDate: Date;
  onPickupChange: (v: string) => void;
  onPickupSelectSuggestion?: (s: PlaceSuggestion) => void;
  onDropoffChange: (v: string) => void;
  onDropoffSelectSuggestion?: (s: PlaceSuggestion) => void;
  onMaxFareChange: (value: number) => void;
  onRideTypeChange: (v: RideType) => void;
  onScheduleDateChange: (d: Date) => void;
  onFindRides: () => void;
  isSubmitting?: boolean;
  onNavigate: (route: AppRouteName) => void;
};

export function ScheduleScreen({
  pickup,
  pickupPlaceholder,
  pickupTimeZone,
  dropoff,
  estimatedTripMiles,
  estimatedTripMinutes,
  maxFareCents,
  rideType,
  scheduleDate,
  onPickupChange,
  onPickupSelectSuggestion,
  onDropoffChange,
  onDropoffSelectSuggestion,
  onMaxFareChange,
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
    <ScreenScaffold
      scrollable
      keyboardDismissOnTap
      innerClassName="px-5 pt-6"
      contentContainerStyle={{ paddingBottom: 16 }}
      footer={
        <>
          <KeyboardDoneAccessory nativeID="schedule-keyboard-done" />
          {!isKeyboardVisible ? (
            <BottomActionButton
              label={isSubmitting ? "Scheduling..." : "Schedule ride"}
              onPress={onFindRides}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          ) : null}
        </>
      }
    >
      <View>
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
          pickupTimeZone={pickupTimeZone}
          onScheduleDateChange={onScheduleDateChange}
        />

        <RideTypeSection
          rideType={rideType}
          onRideTypeChange={onRideTypeChange}
          isLoading={isRideTypeLoading}
        />

        <MaxFareSection
          estimatedTripMiles={estimatedTripMiles}
          estimatedTripMinutes={estimatedTripMinutes}
          maxFareCents={maxFareCents}
          onMaxFareChange={onMaxFareChange}
        />
      </View>
    </ScreenScaffold>
  );
}
