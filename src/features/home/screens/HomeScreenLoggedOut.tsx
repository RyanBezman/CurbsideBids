import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import type { AppRouteName } from "@app/navigation";
import {
  HowItWorksSection,
  NearbyDriversCard,
  QuickActionRow,
  TripSearchCard,
  type QuickAction,
} from "../index";

type HomeScreenLoggedOutProps = {
  onNavigate: (route: AppRouteName) => void;
};

export function HomeScreenLoggedOut({ onNavigate }: HomeScreenLoggedOutProps) {
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="flex-1 px-5 pt-6">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">Curbside</Text>
            <Text className="text-sm text-neutral-500 mt-1">Bid. Ride. Save.</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate("signIn")}
            className="w-11 h-11 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800"
          >
            <Text className="text-base">👤</Text>
          </TouchableOpacity>
        </View>

        <TripSearchCard quickAction={quickAction} onNavigate={onNavigate} />
        <QuickActionRow
          quickAction={quickAction}
          onQuickActionChange={setQuickAction}
          onNavigate={onNavigate}
        />
        <NearbyDriversCard />
        <HowItWorksSection />

        <View className="mt-auto pb-4">
          <TouchableOpacity
            onPress={() => onNavigate("signUp")}
            className="bg-violet-600 rounded-2xl py-4 mb-4"
          >
            <Text className="text-white text-center text-base font-bold">Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("signIn")}>
            <Text className="text-neutral-500 text-sm text-center">
              Already have an account? <Text className="text-violet-400 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
