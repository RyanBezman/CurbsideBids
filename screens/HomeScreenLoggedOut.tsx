import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import type { Screen } from "./types";

type QuickAction = "rides" | "package" | "scheduled";

type Props = {
  onNavigate: (screen: Screen) => void;
};

export function HomeScreenLoggedOut({ onNavigate }: Props) {
  const [quickAction, setQuickAction] = useState<QuickAction>("rides");

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="flex-1 px-5 pt-6">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">
              Curbside
            </Text>
            <Text className="text-sm text-neutral-500 mt-1">
              Bid. Ride. Save.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate("signin")}
            className="w-11 h-11 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800"
          >
            <Text className="text-base">👤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (quickAction === "package") onNavigate("package");
            else if (quickAction === "scheduled") onNavigate("schedule");
            else onNavigate("whereto");
          }}
          className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800"
        >
          <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
          <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
          <Text className="text-violet-400">→</Text>
        </TouchableOpacity>

        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={() => {
              setQuickAction("rides");
              onNavigate("whereto");
            }}
            className={`flex-1 rounded-2xl py-5 items-center border ${
              quickAction === "rides"
                ? "bg-violet-600 border-violet-500"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <Text className="text-xl mb-1">🚗</Text>
            <Text
              className={`font-semibold text-sm ${
                quickAction === "rides" ? "text-white" : "text-neutral-300"
              }`}
            >
              Ride
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setQuickAction("package");
              onNavigate("package");
            }}
            className={`flex-1 rounded-2xl py-5 items-center border ${
              quickAction === "package"
                ? "bg-violet-600 border-violet-500"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <Text className="text-xl mb-1">📦</Text>
            <Text
              className={`font-semibold text-sm ${
                quickAction === "package" ? "text-white" : "text-neutral-300"
              }`}
            >
              Package
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setQuickAction("scheduled");
              onNavigate("schedule");
            }}
            className={`flex-1 rounded-2xl py-5 items-center border ${
              quickAction === "scheduled"
                ? "bg-violet-600 border-violet-500"
                : "bg-neutral-900 border-neutral-800"
            }`}
          >
            <Text className="text-xl mb-1">📅</Text>
            <Text
              className={`font-semibold text-sm ${
                quickAction === "scheduled" ? "text-white" : "text-neutral-300"
              }`}
            >
              Schedule
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
          <Text className="text-neutral-400 text-sm flex-1">
            <Text className="text-white font-semibold">247</Text> drivers nearby
          </Text>
          <Text className="text-violet-400 text-sm font-medium">
            ~3 min pickup
          </Text>
        </View>

        <Text className="text-white text-lg font-semibold mb-4">
          How it works
        </Text>

        <View className="gap-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Enter destination</Text>
              <Text className="text-neutral-500 text-sm">
                Tell us where you're going
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Get live bids</Text>
              <Text className="text-neutral-500 text-sm">
                Drivers compete for your ride
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-violet-600/20 items-center justify-center mr-4 border border-violet-500/30">
              <Text className="text-violet-400 text-xs font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-medium">Choose & go</Text>
              <Text className="text-neutral-500 text-sm">
                Pick the best price, ride in minutes
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-auto pb-4">
          <TouchableOpacity
            onPress={() => onNavigate("signup")}
            className="bg-violet-600 rounded-2xl py-4 mb-4"
          >
            <Text className="text-white text-center text-base font-bold">
              Get Started
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate("signin")}>
            <Text className="text-neutral-500 text-sm text-center">
              Already have an account?{" "}
              <Text className="text-violet-400 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
