import "./global.css";
import { useEffect } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import {
  SignInScreen,
  SignUpScreen,
  WhereToScreen,
  PackageScreen,
  ScheduleScreen,
  HomeScreenLoggedIn,
  HomeScreenLoggedOut,
} from "./screens";
import type { Screen } from "./screens";
import { useAppSession } from "./hooks/app/useAppSession";
import { useRideRequestState } from "./hooks/app/useRideRequestState";
import { useScheduleSubmission } from "./hooks/app/useScheduleSubmission";
import { useRecentReservations } from "./hooks/reservations/useRecentReservations";
import { useAuthFlow } from "./hooks/app/useAuthFlow";

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

export default function App() {
  const { user } = useAppSession();
  const {
    dropoff,
    dropoffLocation,
    fillPickupFromCurrentLocation,
    handleDropoffChange,
    handleDropoffSelectSuggestion,
    handlePickupChange,
    handlePickupSelectSuggestion,
    pickup,
    pickupLocation,
    pickupPlaceholder,
    rideType,
    scheduleDate,
    setDropoff,
    setDropoffLocation,
    setRideType,
    setScheduleDate,
  } = useRideRequestState();

  const {
    handleCancelReservation,
    isCancelingReservation,
    isLoadingRecentReservations,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  } = useRecentReservations(user);

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

  const {
    clearPendingScheduleSubmission,
    handleScheduleFindRides,
    isSchedulingRide,
    pendingScheduleSubmissionRef,
  } = useScheduleSubmission({
    dropoff,
    dropoffLocation,
    loadRecentReservations,
    onNavigate,
    pickup,
    pickupLocation,
    rideType,
    scheduleDate,
    setDropoff,
    setDropoffLocation,
    setRideType,
    user,
  });

  const {
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
  } = useAuthFlow({
    onNavigate,
    onSignedOut: () => {
      clearPendingScheduleSubmission();
      resetRecentReservations();
    },
  });

  useEffect(() => {
    if (!navigationRef.isReady()) return;

    const hasPendingScheduleSubmission = Boolean(
      user && pendingScheduleSubmissionRef.current,
    );

    if (hasPendingScheduleSubmission) return;

    navigationRef.resetRoot({
      index: 0,
      routes: [{ name: "home" }],
    });
  }, [user, pendingScheduleSubmissionRef]);

  useEffect(() => {
    if (!user) {
      resetRecentReservations();
      return;
    }

    void loadRecentReservations(user.id);
  }, [loadRecentReservations, resetRecentReservations, user]);

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
                recentReservations={recentReservations}
                isLoadingRecentReservations={isLoadingRecentReservations}
                isCancelingReservation={isCancelingReservation}
                onCancelReservation={handleCancelReservation}
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
              isSubmitting={isSchedulingRide}
              onNavigate={onNavigate}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
