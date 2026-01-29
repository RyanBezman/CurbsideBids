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
import type { Screen } from "./types";

type Props = {
  pickup: string;
  dropoff: string;
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onSendPackage: () => void;
  onNavigate: (screen: Screen) => void;
};

const PACKAGE_GRAPHIC = require("../graphics/package.png");

export function PackageScreen({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onSendPackage,
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
              <Text className="text-2xl font-bold text-white">
                Send package
              </Text>
            </View>

            <LocationInput
              variant="pickup"
              value={pickup}
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
                minsAway="15 min away"
                arrival="Est. delivery ~3:15 PM"
                selected
                onSelect={() => {}}
                label="Package"
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-5 pb-4 pt-2 border-t border-neutral-800 bg-neutral-950">
          <TouchableOpacity
            onPress={onSendPackage}
            className="bg-violet-600 rounded-2xl py-4"
          >
            <Text className="text-white text-center text-base font-bold">
              Find delivery
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
