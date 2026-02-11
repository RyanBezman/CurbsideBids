import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import type { AccountRole, Screen } from "./types";

type Props = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: AccountRole;
  loading: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRoleChange: (v: AccountRole) => void;
  onSignUp: () => void;
  onNavigate: (screen: Screen) => void;
};

export function SignUpScreen({
  name,
  email,
  phone,
  password,
  role,
  loading,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onRoleChange,
  onSignUp,
  onNavigate,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-5 pt-6">
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={() => onNavigate("home")}
                className="w-10 h-10 bg-neutral-900 rounded-full items-center justify-center border border-neutral-800 mr-4"
              >
                <Text className="text-white text-lg">←</Text>
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-white">
                Create Account
              </Text>
            </View>

            <View className="gap-4 mb-8">
              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Account Type
                </Text>
                <View className="bg-neutral-900 rounded-2xl p-1 border border-neutral-800 flex-row">
                  <TouchableOpacity
                    onPress={() => onRoleChange("rider")}
                    className={`flex-1 rounded-xl py-3 items-center ${
                      role === "rider" ? "bg-violet-600" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        role === "rider" ? "text-white" : "text-neutral-300"
                      }`}
                    >
                      Rider
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onRoleChange("driver")}
                    className={`flex-1 rounded-xl py-3 items-center ${
                      role === "driver" ? "bg-violet-600" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        role === "driver" ? "text-white" : "text-neutral-300"
                      }`}
                    >
                      Driver
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={onNameChange}
                  placeholder="John Doe"
                  placeholderTextColor="#525252"
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
              </View>
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
              </View>
              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={onPhoneChange}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#525252"
                  keyboardType="phone-pad"
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
              </View>
              <View>
                <Text className="text-neutral-400 text-sm mb-2 ml-1">
                  Password
                </Text>
                <TextInput
                  value={password}
                  onChangeText={onPasswordChange}
                  placeholder="Create a password"
                  placeholderTextColor="#525252"
                  secureTextEntry
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
              </View>
            </View>

            <Text className="text-neutral-500 text-xs text-center mb-6 px-4">
              By signing up, you agree to our{" "}
              <Text className="text-violet-400">Terms of Service</Text> and{" "}
              <Text className="text-violet-400">Privacy Policy</Text>
            </Text>

            <TouchableOpacity
              onPress={onSignUp}
              disabled={loading}
              className="bg-violet-600 rounded-2xl py-4 mb-4"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-base font-bold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onNavigate("signin")}
              disabled={loading}
            >
              <Text className="text-neutral-500 text-sm text-center">
                Already have an account?{" "}
                <Text className="text-violet-400 font-medium">Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
