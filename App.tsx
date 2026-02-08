import "./global.css";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useMemo, useRef } from "react";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";
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

function isRideRequestScreen(screen: Screen): boolean {
  return screen === "whereto" || screen === "package" || screen === "schedule";
}

function formatPickupFromLocation(
  coords: Location.LocationObjectCoords,
  place?: Location.LocationGeocodedAddress,
): string {
  if (place) {
    const street = [place.streetNumber, place.street]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim();
    const area = [place.city ?? place.subregion, place.region]
      .filter((part): part is string => Boolean(part))
      .join(", ");
    const namedPlace = place.name?.trim();

    if (street && area) return `${street}, ${area}`;
    if (street) return street;
    if (namedPlace && area) return `${namedPlace}, ${area}`;
    if (namedPlace) return namedPlace;
    if (area) return area;
  }

  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

async function ensureForegroundLocationPermission(): Promise<boolean> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    Alert.alert(
      "Location Services Off",
      "Turn on Location Services in iOS Settings to use your current pickup.",
    );
    return false;
  }

  const currentPermission = await Location.getForegroundPermissionsAsync();
  if (currentPermission.granted) return true;

  if (currentPermission.canAskAgain) {
    const requestedPermission =
      await Location.requestForegroundPermissionsAsync();
    return requestedPermission.granted;
  }

  Alert.alert(
    "Location Permission Needed",
    "Enable Location access in Settings to auto-fill pickup with your current location.",
    [
      { text: "Not now", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ],
  );
  return false;
}

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
  const [isResolvingPickupLocation, setIsResolvingPickupLocation] =
    useState(false);
  const isResolvingPickupLocationRef = useRef(false);
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

  const fillPickupFromCurrentLocation = async () => {
    if (isResolvingPickupLocationRef.current) return;

    isResolvingPickupLocationRef.current = true;
    setIsResolvingPickupLocation(true);
    try {
      const canUseLocation = await ensureForegroundLocationPermission();
      if (!canUseLocation) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const pickupLabel = formatPickupFromLocation(
        currentLocation.coords,
        geocoded[0],
      );

      // Preserve any value the user entered while geolocation was resolving.
      setPickup((prev) => (prev.trim() ? prev : pickupLabel));
    } catch (error) {
      console.warn("Unable to auto-fill pickup from current location", error);
    } finally {
      setIsResolvingPickupLocation(false);
      isResolvingPickupLocationRef.current = false;
    }
  };

  const onNavigate = (next: Screen) => {
    setScreen(next);

    if (isRideRequestScreen(next) && pickup.trim().length === 0) {
      void fillPickupFromCurrentLocation();
    }
  };

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
        pickupPlaceholder={
          isResolvingPickupLocation ? "Detecting current location..." : undefined
        }
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
        pickupPlaceholder={
          isResolvingPickupLocation ? "Detecting current location..." : undefined
        }
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
        pickupPlaceholder={
          isResolvingPickupLocation ? "Detecting current location..." : undefined
        }
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
