import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Keyboard,
  InputAccessoryView,
} from "react-native";

type Props = {
  nativeID: string;
};

/** iOS-only: Renders a Done bar above the keyboard for easy dismissal. */
export function KeyboardDoneAccessory({ nativeID }: Props) {
  if (Platform.OS !== "ios") return null;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 flex-row justify-end">
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          className="px-4 py-2 bg-violet-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Done</Text>
        </TouchableOpacity>
      </View>
    </InputAccessoryView>
  );
}
