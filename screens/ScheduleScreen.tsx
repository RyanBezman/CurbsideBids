import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  BottomActionButton,
  BackTitleHeader,
  LocationInput,
  RideTypeCard,
} from "../components";
import { useEntryLoading } from "../lib/useEntryLoading";
import type { Screen, RideType } from "./types";
import { RIDE_ASSET_MODULES, RIDE_OPTIONS } from "./rideOptions";

function formatScheduleDatetime(d: Date): string {
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} • ${time}`;
}

type ScheduleScreenProps = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  rideType: RideType;
  scheduleDate: Date;
  onPickupChange: (v: string) => void;
  onDropoffChange: (v: string) => void;
  onRideTypeChange: (v: RideType) => void;
  onScheduleDateChange: (d: Date) => void;
  onFindRides: () => void;
  onNavigate: (screen: Screen) => void;
};

export function ScheduleScreen({
  pickup,
  pickupPlaceholder,
  dropoff,
  rideType,
  scheduleDate,
  onPickupChange,
  onDropoffChange,
  onRideTypeChange,
  onScheduleDateChange,
  onFindRides,
  onNavigate,
}: ScheduleScreenProps) {
  const [showPicker, setShowPicker] = useState(false);
  const isRideTypeLoading = useEntryLoading({
    assetModules: RIDE_ASSET_MODULES,
  });

  const handlePickerChange = (
    event: { type: string },
    selectedDate: Date | undefined,
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    // Only update when user confirms ('set'). Ignore 'dismissed' / 'neutralButtonPressed'
    // so we don't overwrite the selection with stale or original value.
    if (event.type === "set" && selectedDate) {
      onScheduleDateChange(selectedDate);
    }
  };

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
            <BackTitleHeader title="Schedule ride" onBack={() => onNavigate("home")} />

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
              Date & time
            </Text>
            <TouchableOpacity
              onPress={() => setShowPicker((prev) => !prev)}
              className="bg-neutral-900 rounded-2xl px-5 py-4 flex-row items-center border border-neutral-800 mb-5"
            >
              <View className="w-3 h-3 rounded-full bg-amber-500 mr-4" />
              <Text className="text-white text-base flex-1">
                {formatScheduleDatetime(scheduleDate)}
              </Text>
              <Text className="text-violet-400">⌄</Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={scheduleDate}
                mode="datetime"
                minimumDate={(() => {
                  const d = new Date();
                  d.setSeconds(0, 0);
                  return d;
                })()}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handlePickerChange}
                textColor="#9ca3af"
                themeVariant="dark"
              />
            )}
            {Platform.OS === "ios" && showPicker && (
              <View className="flex-row justify-end gap-3 mb-4">
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  className="bg-neutral-800 rounded-xl px-4 py-2"
                >
                  <Text className="text-neutral-300">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  className="bg-violet-600 rounded-xl px-4 py-2"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
            )}

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
