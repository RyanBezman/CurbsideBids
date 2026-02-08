import { View, Text, TextInput, Platform } from "react-native";

type Variant = "pickup" | "dropoff";

type Props = {
  variant: Variant;
  value: string;
  onChangeText: (v: string) => void;
  label?: string;
  placeholder?: string;
};

const VARIANTS: Record<
  Variant,
  { label: string; placeholder: string; dotClass: string }
> = {
  pickup: {
    label: "Pickup",
    placeholder: "Enter pickup location",
    dotClass: "bg-green-500",
  },
  dropoff: {
    label: "Dropoff",
    placeholder: "Enter destination",
    dotClass: "bg-violet-500",
  },
};

export function LocationInput({
  variant,
  value,
  onChangeText,
  label,
  placeholder,
}: Props) {
  const {
    label: defaultLabel,
    placeholder: defaultPlaceholder,
    dotClass,
  } = VARIANTS[variant];

  return (
    <View className={variant === "pickup" ? "mb-4" : "mb-5"}>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">
        {label ?? defaultLabel}
      </Text>
      <View className="bg-neutral-900 rounded-2xl px-5 flex-row items-center border border-neutral-800">
        <View className={`w-3 h-3 rounded-full ${dotClass} mr-4`} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? defaultPlaceholder}
          placeholderTextColor="#525252"
          className="flex-1 text-white text-base"
          style={{
            height: 56,
            fontSize: 16,
            paddingVertical: 0,
            ...(Platform.OS === "android" && {
              textAlignVertical: "center",
            }),
          }}
        />
      </View>
    </View>
  );
}
