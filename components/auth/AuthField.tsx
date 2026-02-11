import { Platform, Text, TextInput, type KeyboardTypeOptions } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}: Props) {
  return (
    <>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#525252"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        className="bg-neutral-900 rounded-2xl px-5 text-white text-base border border-neutral-800"
        style={{
          height: 56,
          fontSize: 16,
          paddingVertical: 0,
          ...(Platform.OS === "android" && {
            textAlignVertical: "center",
          }),
        }}
      />
    </>
  );
}
