import "./global.css";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import type { Screen, RideType } from "./screens";
import {
  SignUpScreen,
  SignInScreen,
  WhereToScreen,
  HomeScreenLoggedIn,
  HomeScreenLoggedOut,
} from "./screens";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [rideType, setRideType] = useState<RideType>("Economy");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setScreen("home");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, phone } },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } else if (data.user && !data.session) {
      Alert.alert(
        "Check your email",
        "Please check your email to confirm your account before signing in.",
        [{ text: "OK", onPress: () => setScreen("signin") }],
      );
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
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
    setScreen("home");
  };

  const onNavigate = (next: Screen) => setScreen(next);

  if (screen === "signup") {
    return (
      <SignUpScreen
        name={name}
        email={email}
        phone={phone}
        password={password}
        loading={loading}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onPasswordChange={setPassword}
        onSignUp={handleSignUp}
        onNavigate={onNavigate}
      />
    );
  }

  if (screen === "signin") {
    return (
      <SignInScreen
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignIn={handleSignIn}
        onNavigate={onNavigate}
      />
    );
  }

  if (screen === "whereto") {
    return (
      <WhereToScreen
        pickup={pickup}
        dropoff={dropoff}
        rideType={rideType}
        onPickupChange={setPickup}
        onDropoffChange={setDropoff}
        onRideTypeChange={setRideType}
        onFindRides={() => onNavigate("home")}
        onNavigate={onNavigate}
      />
    );
  }

  if (user) {
    return (
      <HomeScreenLoggedIn
        user={user}
        onSignOut={handleSignOut}
        onNavigate={onNavigate}
      />
    );
  }

  return <HomeScreenLoggedOut onNavigate={onNavigate} />;
}
