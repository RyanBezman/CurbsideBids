import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import type { Screen } from "./types";

type Props = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSignIn: () => void;
  onNavigate: (screen: Screen) => void;
};

export function SignInScreen({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onNavigate,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-5 pt-6">
          <View className="flex-row items-center mb-8">
            <TouchableOpacity
              onPress={() => onNavigate("home")}
              className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">
              Welcome Back
            </Text>
          </View>

          <View className="gap-4 mb-8">
            <View>
              <Text className="text-neutral-400 text-sm mb-2 ml-1">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={onEmailChange}
                placeholder="john@example.com"
                placeholderTextColor="#525252"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
              />
            </View>
            <View>
              <Text className="text-neutral-400 text-sm mb-2 ml-1">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={onPasswordChange}
                placeholder="Enter your password"
                placeholderTextColor="#525252"
                secureTextEntry
                className="bg-neutral-900 rounded-2xl px-5 py-4 text-white text-base border border-neutral-800"
              />
            </View>
          </View>

          <TouchableOpacity className="mb-8">
            <Text className="text-violet-400 text-sm text-center font-medium">
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignIn}
            disabled={loading}
            className="bg-violet-600 rounded-2xl py-4 mb-4"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-base font-bold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigate("signup")}
            disabled={loading}
          >
            <Text className="text-neutral-500 text-sm text-center">
              Don't have an account?{" "}
              <Text className="text-violet-400 font-medium">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
