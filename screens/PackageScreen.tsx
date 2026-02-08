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
import type { Screen } from "./types";

type Props = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onSendPackage: () => void;
  onNavigate: (screen: Screen) => void;
};

const PACKAGE_GRAPHIC = require("../graphics/package.png");
const PACKAGE_ASSET_MODULES = [PACKAGE_GRAPHIC] as const;

export function PackageScreen({
  pickup,
  pickupPlaceholder,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onSendPackage,
  onNavigate,
}: Props) {
  const isRideTypeLoading = useEntryLoading({
    assetModules: PACKAGE_ASSET_MODULES,
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
            <BackTitleHeader title="Send package" onBack={() => onNavigate("home")} />

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
              Package delivery
            </Text>
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
        </ScrollView>

        <BottomActionButton label="Find delivery" onPress={onSendPackage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
