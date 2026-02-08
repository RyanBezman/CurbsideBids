import "./global.css";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { formatPhoneForDisplay, normalizePhoneInput } from "./lib/phone";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import type { Screen, RideType, SchedulePayload } from "./screens";
import {
  SignUpScreen,
  SignInScreen,
  WhereToScreen,
  PackageScreen,
  ScheduleScreen,
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
  /** Schedule date/time; held in state for schedule flow and future API submission. */
  const [scheduleDate, setScheduleDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });

  /** Schedule form payload; use when submitting to API (e.g. scheduledAt.toISOString()). */
  const schedulePayload: SchedulePayload = useMemo(
    () => ({
      pickup,
      dropoff,
      rideType,
      scheduledAt: scheduleDate,
    }),
    [pickup, dropoff, rideType, scheduleDate],
  );
  const phoneDisplayValue = useMemo(() => formatPhoneForDisplay(phone), [phone]);

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

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhoneInput(value));
  };

  const onNavigate = (next: Screen) => setScreen(next);

  if (screen === "signup") {
    return (
      <SignUpScreen
        name={name}
        email={email}
        phone={phoneDisplayValue}
        password={password}
        loading={loading}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={handlePhoneChange}
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

  if (screen === "package") {
    return (
      <PackageScreen
        pickup={pickup}
        dropoff={dropoff}
        onPickupChange={setPickup}
        onDropoffChange={setDropoff}
        onSendPackage={() => onNavigate("home")}
        onNavigate={onNavigate}
      />
    );
  }

  if (screen === "schedule") {
    return (
      <ScheduleScreen
        pickup={pickup}
        dropoff={dropoff}
        rideType={rideType}
        scheduleDate={scheduleDate}
        onPickupChange={setPickup}
        onDropoffChange={setDropoff}
        onRideTypeChange={setRideType}
        onScheduleDateChange={setScheduleDate}
        onFindRides={() => {
          // TODO: send schedulePayload to API (e.g. scheduledAt.toISOString())
          onNavigate("home");
        }}
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
