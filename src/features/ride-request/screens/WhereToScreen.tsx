import { View } from "react-native";
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
import { LocationSection, RideTypeSection } from "../components";

type WhereToScreenProps = {
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
  onNavigate: (route: AppRouteName) => void;
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
}: WhereToScreenProps) {
  const isRideTypeLoading = useEntryLoading({
    assetModules: RIDE_ASSET_MODULES,
  });

  return (
    <ScreenScaffold
      scrollable
      keyboardDismissOnTap
      innerClassName="px-5 pt-6"
      contentContainerStyle={{ paddingBottom: 16 }}
      footer={
        <>
          <KeyboardDoneAccessory nativeID="whereto-keyboard-done" />
          <BottomActionButton label="Find rides" onPress={onFindRides} />
        </>
      }
    >
      <View>
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
    </ScreenScaffold>
  );
}
