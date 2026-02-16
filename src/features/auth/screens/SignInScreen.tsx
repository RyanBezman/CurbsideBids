import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthField, AuthHeader } from "../components";
import type { AppRouteName } from "../../../app/navigation";
import { ScreenScaffold } from "../../../shared/ui";

type SignInScreenProps = {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSignIn: () => void;
  onNavigate: (route: AppRouteName) => void;
};

export function SignInScreen({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onNavigate,
}: SignInScreenProps) {
  return (
    <ScreenScaffold innerClassName="px-5 pt-6">
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

      <TouchableOpacity onPress={() => onNavigate("signUp")} disabled={loading}>
        <Text className="text-neutral-500 text-sm text-center">
          Don't have an account? <Text className="text-violet-400 font-medium">Sign up</Text>
        </Text>
      </TouchableOpacity>
    </ScreenScaffold>
  );
}
