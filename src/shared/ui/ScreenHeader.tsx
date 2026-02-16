import { Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  className?: string;
};

export function ScreenHeader({ title, onBack, className }: ScreenHeaderProps) {
  return (
    <View className={className ?? "flex-row items-center mb-6"}>
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
