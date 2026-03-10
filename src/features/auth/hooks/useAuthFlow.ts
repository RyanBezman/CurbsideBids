import { useMemo, useState } from "react";
import { Alert } from "react-native";
import type { AppRouteName } from "@app/navigation";
import type { AccountRole } from "@domain/auth";
import { supabase } from "@shared/api";
import { formatPhoneForDisplay, normalizePhoneInput } from "@shared/lib";

type UseAuthFlowOptions = {
  onNavigate: (route: AppRouteName) => void;
  onSignedOut: () => void;
};

export function useAuthFlow({ onNavigate, onSignedOut }: UseAuthFlowOptions) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("rider");
  const [loading, setLoading] = useState(false);

  const phoneDisplayValue = useMemo(() => formatPhoneForDisplay(phone), [phone]);

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhoneInput(value));
  };

  const resetSignUpForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("rider");
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone, role } },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      resetSignUpForm();
    } else if (data.user && !data.session) {
      Alert.alert(
        "Check your email",
        "Please check your email to confirm your account before signing in.",
        [{ text: "OK", onPress: () => onNavigate("signIn") }],
      );
      resetSignUpForm();
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      onSignedOut();
      onNavigate("home");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign out right now.";
      Alert.alert("Error", message);
    }
  };

  return {
    email,
    handlePhoneChange,
    handleSignIn,
    handleSignOut,
    handleSignUp,
    loading,
    name,
    password,
    phoneDisplayValue,
    role,
    setEmail,
    setName,
    setPassword,
    setRole,
  };
}
