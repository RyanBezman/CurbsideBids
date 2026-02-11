import { ActivityIndicator, View, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function BottomActionButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const isDisabled = loading || disabled;

  return (
    <View className="px-5 pb-4 pt-2 border-t border-neutral-800 bg-neutral-950">
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        className={`rounded-2xl py-4 ${isDisabled ? "bg-violet-600/70" : "bg-violet-600"}`}
      >
        <View className="flex-row items-center justify-center gap-2">
          {loading ? <ActivityIndicator color="#ffffff" size="small" /> : null}
          <Text className="text-white text-center text-base font-bold">{label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
