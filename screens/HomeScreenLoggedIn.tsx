import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import type { User } from "@supabase/supabase-js";
import type { Screen } from "./types";

type Props = {
  user: User;
  onSignOut: () => void;
  onNavigate: (screen: Screen) => void;
};

export function HomeScreenLoggedIn({
  user,
  onSignOut,
  onNavigate,
}: Props) {
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
              Welcome back!
            </Text>
          </View>
          <TouchableOpacity
            onPress={onSignOut}
            className="bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800"
          >
            <Text className="text-neutral-300 text-sm font-medium">
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-neutral-900 rounded-2xl p-5 mb-6 border border-neutral-800">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-violet-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {(user.user_metadata?.full_name || user.email)
                  ?.charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">
                {user.user_metadata?.full_name || user.email}
              </Text>
              <Text className="text-neutral-500 text-sm">Rider</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onNavigate("whereto")}
          className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800"
        >
          <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
          <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
          <Text className="text-violet-400">→</Text>
        </TouchableOpacity>

        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={() => onNavigate("whereto")}
            className="flex-1 bg-violet-600 rounded-2xl py-5 items-center"
          >
            <Text className="text-xl mb-1">🚗</Text>
            <Text className="text-white font-semibold text-sm">Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
            <Text className="text-xl mb-1">📦</Text>
            <Text className="text-neutral-300 font-semibold text-sm">
              Package
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-neutral-900 rounded-2xl py-5 items-center border border-neutral-800">
            <Text className="text-xl mb-1">📅</Text>
            <Text className="text-neutral-300 font-semibold text-sm">
              Schedule
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
          <Text className="text-neutral-400 text-sm flex-1">
            <Text className="text-white font-semibold">247</Text> drivers
            nearby
          </Text>
          <Text className="text-violet-400 text-sm font-medium">
            ~3 min pickup
          </Text>
        </View>

        <Text className="text-white text-lg font-semibold mb-4">
          Recent Activity
        </Text>
        <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
          <Text className="text-neutral-500 text-sm text-center">
            No recent rides yet
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
