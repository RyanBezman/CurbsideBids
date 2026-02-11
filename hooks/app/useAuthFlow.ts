import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { formatPhoneForDisplay, normalizePhoneInput } from "../../lib/phone";
import { supabase } from "../../lib/supabase";
import type { AccountRole, Screen } from "../../screens";

type Params = {
  onNavigate: (screen: Screen) => void;
  onSignedOut: () => void;
};

export function useAuthFlow({ onNavigate, onSignedOut }: Params) {
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
        [{ text: "OK", onPress: () => onNavigate("signin") }],
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
    await supabase.auth.signOut();
    onSignedOut();
    onNavigate("home");
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
