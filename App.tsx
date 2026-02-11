import "./global.css";
import { useState, useEffect, useMemo, useRef } from "react";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { formatPhoneForDisplay, normalizePhoneInput } from "./lib/phone";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";
import type { AccountRole, Screen, RideType, SchedulePayload } from "./screens";
import {
  locationPointFromDevice,
  locationPointFromSuggestion,
  type LocationPoint,
} from "./lib/places/locationPoint";
import type { PlaceSuggestion } from "./lib/places/types";
import {
  SignUpScreen,
  SignInScreen,
  WhereToScreen,
  PackageScreen,
  ScheduleScreen,
  HomeScreenLoggedIn,
  HomeScreenLoggedOut,
} from "./screens";

type RootStackParamList = {
  home: undefined;
  signup: undefined;
  signin: undefined;
  whereto: undefined;
  package: undefined;
  schedule: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

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

function formatPickupDisplayFromLocation(
  coords: Location.LocationObjectCoords,
  place?: Location.LocationGeocodedAddress,
): string {
  if (place) {
    const street = [place.streetNumber, place.street]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim();
    const namedPlace = place.name?.trim();

    if (street) return street;
    if (namedPlace) return namedPlace;
  }

  return formatPickupFromLocation(coords, place);
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("rider");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupLocation, setPickupLocation] = useState<LocationPoint | null>(
    null,
  );
  const [dropoffLocation, setDropoffLocation] = useState<LocationPoint | null>(
    null,
  );
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

  const phoneDisplayValue = useMemo(() => formatPhoneForDisplay(phone), [phone]);
  const pickupPlaceholder = isResolvingPickupLocation
    ? "Detecting current location..."
    : undefined;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (navigationRef.isReady()) {
        navigationRef.resetRoot({
          index: 0,
          routes: [{ name: "home" }],
        });
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
      options: { data: { full_name: name, phone, role } },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else if (data.session) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("rider");
    } else if (data.user && !data.session) {
      Alert.alert(
        "Check your email",
        "Please check your email to confirm your account before signing in.",
        [{ text: "OK", onPress: () => onNavigate("signin") }],
      );
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("rider");
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
    onNavigate("home");
  };

  const handlePhoneChange = (value: string) => {
    setPhone(normalizePhoneInput(value));
  };

  const handlePickupChange = (value: string) => {
    setPickup(value);
    // If the user edits the text after selecting a suggestion (or auto-fill),
    // treat it as "unselected".
    setPickupLocation(null);
  };

  const handlePickupSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setPickupLocation(locationPointFromSuggestion(suggestion));
  };

  const handleDropoffChange = (value: string) => {
    setDropoff(value);
    // If the user edits the text after selecting a suggestion, treat it as "unselected".
    setDropoffLocation(null);
  };

  const handleDropoffSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setDropoffLocation(locationPointFromSuggestion(suggestion));
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
      const pickupDisplay = formatPickupDisplayFromLocation(
        currentLocation.coords,
        geocoded[0],
      );

      // Preserve any value the user entered while geolocation was resolving.
      let applied = false;
      setPickup((prev) => {
        if (prev.trim()) return prev;
        applied = true;
        return pickupDisplay;
      });
      if (applied) {
        setPickupLocation(
          locationPointFromDevice({
            label: pickupLabel,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          }),
        );
      }
    } catch (error) {
      console.warn("Unable to auto-fill pickup from current location", error);
    } finally {
      setIsResolvingPickupLocation(false);
      isResolvingPickupLocationRef.current = false;
    }
  };

  const onNavigate = (next: Screen) => {
    if (isRideRequestScreen(next) && pickup.trim().length === 0) {
      void fillPickupFromCurrentLocation();
    }

    if (!navigationRef.isReady()) return;

    if (next === "home") {
      navigationRef.resetRoot({
        index: 0,
        routes: [{ name: "home" }],
      });
      return;
    }

    navigationRef.navigate(next);
  };

  const handleScheduleFindRides = () => {
    // Keep this payload construction close to submit action for easy API integration.
    const schedulePayload: SchedulePayload = {
      pickup,
      dropoff,
      pickupLocation,
      dropoffLocation,
      rideType,
      scheduledAt: scheduleDate,
    };
    void schedulePayload;
    onNavigate("home");
  };

  const sharedStackOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: "slide_from_right",
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="home" screenOptions={sharedStackOptions}>
        <Stack.Screen name="home">
          {() =>
            user ? (
              <HomeScreenLoggedIn
                user={user}
                onSignOut={handleSignOut}
                onNavigate={onNavigate}
              />
            ) : (
              <HomeScreenLoggedOut onNavigate={onNavigate} />
            )
          }
        </Stack.Screen>
        <Stack.Screen name="signup">
          {() => (
            <SignUpScreen
              name={name}
              email={email}
              phone={phoneDisplayValue}
              password={password}
              role={role}
              loading={loading}
              onNameChange={setName}
              onEmailChange={setEmail}
              onPhoneChange={handlePhoneChange}
              onPasswordChange={setPassword}
              onRoleChange={setRole}
              onSignUp={handleSignUp}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="signin">
          {() => (
            <SignInScreen
              email={email}
              password={password}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSignIn={handleSignIn}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="whereto">
          {() => (
            <WhereToScreen
              pickup={pickup}
              pickupPlaceholder={pickupPlaceholder}
              dropoff={dropoff}
              rideType={rideType}
              onPickupChange={handlePickupChange}
              onPickupSelectSuggestion={handlePickupSelectSuggestion}
              onDropoffChange={handleDropoffChange}
              onDropoffSelectSuggestion={handleDropoffSelectSuggestion}
              onRideTypeChange={setRideType}
              onFindRides={() => onNavigate("home")}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="package">
          {() => (
            <PackageScreen
              pickup={pickup}
              pickupPlaceholder={pickupPlaceholder}
              dropoff={dropoff}
              onPickupChange={handlePickupChange}
              onPickupSelectSuggestion={handlePickupSelectSuggestion}
              onDropoffChange={handleDropoffChange}
              onDropoffSelectSuggestion={handleDropoffSelectSuggestion}
              onSendPackage={() => onNavigate("home")}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="schedule">
          {() => (
            <ScheduleScreen
              pickup={pickup}
              pickupPlaceholder={pickupPlaceholder}
              dropoff={dropoff}
              rideType={rideType}
              scheduleDate={scheduleDate}
              onPickupChange={handlePickupChange}
              onPickupSelectSuggestion={handlePickupSelectSuggestion}
              onDropoffChange={handleDropoffChange}
              onDropoffSelectSuggestion={handleDropoffSelectSuggestion}
              onRideTypeChange={setRideType}
              onScheduleDateChange={setScheduleDate}
              onFindRides={handleScheduleFindRides}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
