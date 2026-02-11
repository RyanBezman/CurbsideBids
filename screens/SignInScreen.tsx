import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { AuthField, AuthHeader } from "../components";
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
          <AuthHeader title="Welcome Back" onBack={() => onNavigate("home")} />

          <View className="gap-4 mb-8">
            <View>
              <AuthField
                label="Email"
                value={email}
                onChangeText={onEmailChange}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View>
              <AuthField
                label="Password"
                value={password}
                onChangeText={onPasswordChange}
                placeholder="Enter your password"
                secureTextEntry
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
              <Text className="text-white text-center text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onNavigate("signup")} disabled={loading}>
            <Text className="text-neutral-500 text-sm text-center">
              Don't have an account? <Text className="text-violet-400 font-medium">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
