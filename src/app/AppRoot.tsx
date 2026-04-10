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
  toAppRouteName,
  type NavigableRouteName,
  type RootStackParamList,
} from "@app/navigation";
import {
  useAppSession,
  useAuthFlowBindings,
  useHomeFlow,
  useRideRequestFlow,
} from "@app/hooks";
import { SignInScreen, SignUpScreen } from "@features/auth";
import { HomeScreenLoggedIn, HomeScreenLoggedOut } from "@features/home";
import {
  PackageScreen,
  ScheduleScreen,
  WhereToScreen,
  useScheduleSubmission,
} from "@features/ride-request";

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function AppRoot() {
  const { user } = useAppSession();
  const {
    dropoff,
    dropoffLocation,
    estimatedTripMiles,
    estimatedTripMinutes,
    handleDropoffChange,
    handleDropoffSelectSuggestion,
    handlePickupChange,
    handlePickupSelectSuggestion,
    pickup,
    pickupLocation,
    pickupPlaceholder,
    maxFareCents,
    rideType,
    scheduleDate,
    setDropoff,
    setDropoffLocation,
    setMaxFareCents,
    setRideType,
    setScheduleDate,
    primePickupForRoute,
  } = useRideRequestFlow();

  const {
    cancelingReservationId,
    handleCancelReservation,
    isCancelingReservation,
    isLoadingRecentReservations,
    isSyncingNewPendingReservation,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  } = useHomeFlow(user);

  const onNavigate = (nextRoute: NavigableRouteName) => {
    const next = toAppRouteName(nextRoute);

    primePickupForRoute(next);

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
    maxFareCents,
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
  } = useAuthFlowBindings({
    onNavigate,
    clearPendingScheduleSubmission,
    resetRecentReservations,
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
                onRefreshReservations={() => loadRecentReservations(user.id)}
                recentReservations={recentReservations}
                isLoadingRecentReservations={isLoadingRecentReservations}
                isSyncingNewPendingReservation={isSyncingNewPendingReservation}
                cancelingReservationId={cancelingReservationId}
                isCancelingReservation={isCancelingReservation}
                onCancelReservation={handleCancelReservation}
              />
            ) : (
              <HomeScreenLoggedOut onNavigate={onNavigate} />
            )
          }
        </Stack.Screen>
        <Stack.Screen name="signUp">
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
        <Stack.Screen name="signIn">
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
        <Stack.Screen name="whereTo">
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
              pickupTimeZone={pickupLocation?.timeZone}
              dropoff={dropoff}
              estimatedTripMiles={estimatedTripMiles}
              estimatedTripMinutes={estimatedTripMinutes}
              maxFareCents={maxFareCents}
              rideType={rideType}
              scheduleDate={scheduleDate}
              onPickupChange={handlePickupChange}
              onPickupSelectSuggestion={handlePickupSelectSuggestion}
              onDropoffChange={handleDropoffChange}
              onDropoffSelectSuggestion={handleDropoffSelectSuggestion}
              onRideTypeChange={setRideType}
              onMaxFareChange={setMaxFareCents}
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
