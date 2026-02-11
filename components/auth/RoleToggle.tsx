import { Text, TouchableOpacity, View } from "react-native";
import type { AccountRole } from "../../screens/types";

type Props = {
  role: AccountRole;
  onRoleChange: (role: AccountRole) => void;
};

export function RoleToggle({ role, onRoleChange }: Props) {
  return (
    <View>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">Account Type</Text>
      <View className="bg-neutral-900 rounded-2xl p-1 border border-neutral-800 flex-row">
        <TouchableOpacity
          onPress={() => onRoleChange("rider")}
          className={`flex-1 rounded-xl py-3 items-center ${
            role === "rider" ? "bg-violet-600" : "bg-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              role === "rider" ? "text-white" : "text-neutral-300"
            }`}
          >
            Rider
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRoleChange("driver")}
          className={`flex-1 rounded-xl py-3 items-center ${
            role === "driver" ? "bg-violet-600" : "bg-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              role === "driver" ? "text-white" : "text-neutral-300"
            }`}
          >
            Driver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
