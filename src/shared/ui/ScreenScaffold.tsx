import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  type ViewStyle,
} from "react-native";

type ScreenScaffoldProps = {
  children: ReactNode;
  scrollable?: boolean;
  innerClassName?: string;
  contentContainerStyle?: ViewStyle;
  keyboardDismissOnTap?: boolean;
  footer?: ReactNode;
};

export function ScreenScaffold({
  children,
  scrollable = false,
  innerClassName = "px-5 pt-6",
  contentContainerStyle,
  keyboardDismissOnTap = false,
  footer,
}: ScreenScaffoldProps) {
  const content = keyboardDismissOnTap ? (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{children}</TouchableWithoutFeedback>
  ) : (
    children
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {scrollable ? (
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            contentContainerStyle={contentContainerStyle}
            showsVerticalScrollIndicator={false}
          >
            <View className={innerClassName}>{content}</View>
          </ScrollView>
        ) : (
          <View className={`flex-1 ${innerClassName}`}>{content}</View>
        )}

        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
