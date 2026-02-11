import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onBack: () => void;
};

export function AuthHeader({ title, onBack }: Props) {
  return (
    <View className="flex-row items-center mb-8">
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
      >
        <Text className="text-white text-lg">←</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-white">{title}</Text>
    </View>
  );
}
