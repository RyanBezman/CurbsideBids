import {
  View,
  Text,
} from "react-native";
import type { AppRouteName } from "../../../app/navigation";
import type { PlaceSuggestion } from "../../../domain/location/placeSuggestion";
import { useEntryLoading } from "../../../shared/lib";
import {
  BackTitleHeader,
  BottomActionButton,
  KeyboardDoneAccessory,
  RideTypeCard,
  ScreenScaffold,
} from "../../../shared/ui";
import { LocationSection } from "../components";

type PackageScreenProps = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  onPickupChange: (v: string) => void;
  onPickupSelectSuggestion?: (s: PlaceSuggestion) => void;
  onDropoffChange: (v: string) => void;
  onDropoffSelectSuggestion?: (s: PlaceSuggestion) => void;
  onSendPackage: () => void;
  onNavigate: (route: AppRouteName) => void;
};

const PACKAGE_GRAPHIC = require("../../../../graphics/package.png");
const PACKAGE_ASSET_MODULES = [PACKAGE_GRAPHIC] as const;

export function PackageScreen({
  pickup,
  pickupPlaceholder,
  dropoff,
  onPickupChange,
  onPickupSelectSuggestion,
  onDropoffChange,
  onDropoffSelectSuggestion,
  onSendPackage,
  onNavigate,
}: PackageScreenProps) {
  const isRideTypeLoading = useEntryLoading({
    assetModules: PACKAGE_ASSET_MODULES,
  });

  return (
    <ScreenScaffold
      scrollable
      keyboardDismissOnTap
      innerClassName="px-5 pt-6"
      contentContainerStyle={{ paddingBottom: 16 }}
      footer={
        <>
          <KeyboardDoneAccessory nativeID="package-keyboard-done" />
          <BottomActionButton label="Find delivery" onPress={onSendPackage} />
        </>
      }
    >
      <View>
        <BackTitleHeader title="Send package" onBack={() => onNavigate("home")} />

        <LocationSection
          pickup={pickup}
          pickupPlaceholder={pickupPlaceholder}
          dropoff={dropoff}
          onPickupChange={onPickupChange}
          onPickupSelectSuggestion={onPickupSelectSuggestion}
          onDropoffChange={onDropoffChange}
          onDropoffSelectSuggestion={onDropoffSelectSuggestion}
          inputAccessoryViewID="package-keyboard-done"
        />

        <Text className="text-neutral-400 text-sm mb-2 ml-1">Package delivery</Text>
        <View className="gap-2">
          <RideTypeCard
            type="Economy"
            source={PACKAGE_GRAPHIC}
            minsAway={isRideTypeLoading ? "" : "15 min away"}
            arrival={isRideTypeLoading ? "" : "Est. delivery ~3:15 PM"}
            selected={!isRideTypeLoading}
            onSelect={() => {}}
            label="Package"
            loading={isRideTypeLoading}
          />
        </View>
      </View>
    </ScreenScaffold>
  );
}
