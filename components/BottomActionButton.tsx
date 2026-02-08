import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export function BottomActionButton({ label, onPress }: Props) {
  return (
    <View className="px-5 pb-4 pt-2 border-t border-neutral-800 bg-neutral-950">
      <TouchableOpacity onPress={onPress} className="bg-violet-600 rounded-2xl py-4">
        <Text className="text-white text-center text-base font-bold">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}
