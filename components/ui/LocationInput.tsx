import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, View, Text, TextInput, Platform } from "react-native";

type Variant = "pickup" | "dropoff";

type Props = {
  variant: Variant;
  value: string;
  onChangeText: (v: string) => void;
  label?: string;
  placeholder?: string;
  /** iOS: nativeID for InputAccessoryView (Done bar above keyboard) */
  inputAccessoryViewID?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  editable?: boolean;
  /**
   * When true (default), we render a single-line ellipsized preview when the input
   * is NOT focused, so long addresses don't make the UI feel messy.
   */
  truncateWhenBlurred?: boolean;
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

export const LocationInput = forwardRef<TextInput, Props>(function LocationInput(
  {
  variant,
  value,
  onChangeText,
  label,
  placeholder,
  inputAccessoryViewID,
  onFocus,
  onBlur,
  editable = true,
  truncateWhenBlurred = true,
}: Props,
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle(ref, () => inputRef.current as TextInput, []);

  const {
    label: defaultLabel,
    placeholder: defaultPlaceholder,
    dotClass,
  } = VARIANTS[variant];

  const showEllipsizedPreview =
    truncateWhenBlurred && !isFocused && value.trim().length > 0;

  return (
    <View className={variant === "pickup" ? "mb-4" : "mb-5"}>
      <Text className="text-neutral-400 text-sm mb-2 ml-1">
        {label ?? defaultLabel}
      </Text>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="bg-neutral-900 rounded-2xl px-5 flex-row items-center border border-neutral-800"
      >
        <View className={`w-3 h-3 rounded-full ${dotClass} mr-4`} />
        <View className="flex-1" style={{ height: 56 }}>
          {showEllipsizedPreview ? (
            <View
              pointerEvents="none"
              style={{ height: 56, justifyContent: "center" }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-white text-base"
                style={{ fontSize: 16 }}
              >
                {value}
              </Text>
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            editable={editable}
            placeholder={placeholder ?? defaultPlaceholder}
            placeholderTextColor="#525252"
            returnKeyType="done"
            blurOnSubmit
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
            className="text-white text-base"
            style={{
              height: 56,
              fontSize: 16,
              paddingVertical: 0,
              opacity: showEllipsizedPreview ? 0 : 1,
              ...(Platform.OS === "android" && {
                textAlignVertical: "center",
              }),
            }}
          />
        </View>
      </Pressable>
    </View>
  );
});
