import { Text, View } from "react-native";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User;
  isDriver: boolean;
};

export function ProfileCard({ user, isDriver }: Props) {
  return (
    <View className="bg-neutral-900 rounded-2xl p-5 mb-6 border border-neutral-800">
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-violet-600 rounded-full items-center justify-center mr-4">
          <Text className="text-white text-xl font-bold">
            {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold text-base">
            {user.user_metadata?.full_name || user.email}
          </Text>
          <Text className="text-neutral-500 text-sm">{isDriver ? "Driver" : "Rider"}</Text>
        </View>
      </View>
    </View>
  );
}
