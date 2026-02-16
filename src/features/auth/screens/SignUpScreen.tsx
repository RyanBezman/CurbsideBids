import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthField, AuthHeader, RoleToggle } from "../components";
import type { AppRouteName } from "../../../app/navigation";
import type { AccountRole } from "../../../domain/auth";
import { ScreenScaffold } from "../../../shared/ui";

type SignUpScreenProps = {
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
  onNavigate: (route: AppRouteName) => void;
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
}: SignUpScreenProps) {
  return (
    <ScreenScaffold
      scrollable
      innerClassName="px-5 pt-6"
      contentContainerStyle={{ paddingBottom: 16 }}
    >
      <AuthHeader title="Create Account" onBack={() => onNavigate("home")} />

      <View className="gap-4 mb-8">
        <RoleToggle role={role} onRoleChange={onRoleChange} />
        <View>
          <AuthField
            label="Full Name"
            value={name}
            onChangeText={onNameChange}
            placeholder="John Doe"
          />
        </View>
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
            label="Phone Number"
            value={phone}
            onChangeText={onPhoneChange}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>
        <View>
          <AuthField
            label="Password"
            value={password}
            onChangeText={onPasswordChange}
            placeholder="Create a password"
            secureTextEntry
          />
        </View>
      </View>

      <Text className="text-neutral-500 text-xs text-center mb-6 px-4">
        By signing up, you agree to our <Text className="text-violet-400">Terms of Service</Text>{" "}
        and <Text className="text-violet-400">Privacy Policy</Text>
      </Text>

      <TouchableOpacity
        onPress={onSignUp}
        disabled={loading}
        className="bg-violet-600 rounded-2xl py-4 mb-4"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center text-base font-bold">Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onNavigate("signIn")} disabled={loading}>
        <Text className="text-neutral-500 text-sm text-center">
          Already have an account? <Text className="text-violet-400 font-medium">Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScreenScaffold>
  );
}
