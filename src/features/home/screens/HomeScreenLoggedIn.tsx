import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import type { User } from "@supabase/supabase-js";
import type { AppRouteName } from "../../../app/navigation";
import { estimateTripDurationMinutes } from "../../../domain/location";
import type { ReservationRecord } from "../../../domain/reservations";
import { getUserRole } from "../../../domain/user";
import {
  RecentActivityList,
  ReservationDetailsModal,
} from "../../reservations";
import {
  NearbyDriversCard,
  PendingReservationCard,
  ProfileCard,
  QuickActionRow,
  ReservationProgressTimeline,
  TripSearchCard,
  type QuickAction,
} from "../index";

type HomeScreenLoggedInProps = {
  user: User;
  onSignOut: () => void;
  onNavigate: (route: AppRouteName) => void;
  recentReservations: ReservationRecord[];
  isLoadingRecentReservations: boolean;
  isSyncingNewPendingReservation: boolean;
  isCancelingReservation: boolean;
  onCancelReservation: (id: string) => Promise<void>;
};

export function HomeScreenLoggedIn({
  user,
  onSignOut,
  onNavigate,
  recentReservations,
  isLoadingRecentReservations,
  isSyncingNewPendingReservation,
  isCancelingReservation,
  onCancelReservation,
}: HomeScreenLoggedInProps) {
  const role = getUserRole(user);
  const isDriver = role === "driver";
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [acceptingReservationId, setAcceptingReservationId] = useState<string | null>(null);
  const [acceptedReservationIds, setAcceptedReservationIds] = useState<string[]>([]);
  const previousReservationIdsRef = useRef<string[]>([]);
  const activeReservationForTimeline = useMemo(() => {
    if (recentReservations.length === 0) return null;

    return (
      recentReservations.find(
        (reservation) => reservation.status === "pending" || reservation.status === "accepted",
      ) ?? null
    );
  }, [recentReservations]);
  const recentActivityReservations = useMemo(
    () => recentReservations.filter((reservation) => reservation.status !== "pending"),
    [recentReservations],
  );

  const selectedReservation = useMemo(
    () =>
      recentReservations.find((reservation) => reservation.id === selectedReservationId) ??
      null,
    [recentReservations, selectedReservationId],
  );

  useEffect(() => {
    if (!selectedReservationId) return;
    const stillExists = recentReservations.some(
      (reservation) => reservation.id === selectedReservationId,
    );

    if (!stillExists) {
      setSelectedReservationId(null);
    }
  }, [recentReservations, selectedReservationId]);

  useEffect(() => {
    if (!isDriver) return;

    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const previousIds = previousReservationIdsRef.current;
    const nextIds = recentReservations.map((reservation) => reservation.id);
    const nextTopId = nextIds[0];
    const hasNewTopReservation = Boolean(nextTopId) && !previousIds.includes(nextTopId);

    if (previousIds.length > 0 && hasNewTopReservation) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    previousReservationIdsRef.current = nextIds;
  }, [isDriver, recentReservations]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <ScrollView
        className="flex-1 px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">Curbside</Text>
            <Text className="text-sm text-neutral-500 mt-1">Welcome back!</Text>
          </View>
          <TouchableOpacity
            onPress={onSignOut}
            className="bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800"
          >
            <Text className="text-neutral-300 text-sm font-medium">Log Out</Text>
          </TouchableOpacity>
        </View>

        <ProfileCard user={user} isDriver={isDriver} />

        {isDriver ? (
          <>
            <View className="flex-row gap-3 mb-8">
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">🚘</Text>
                <Text className="font-semibold text-sm text-neutral-300">Availability</Text>
                <Text className="text-xs text-neutral-500 mt-1">Offline</Text>
              </View>
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">📋</Text>
                <Text className="font-semibold text-sm text-neutral-300">Requests</Text>
                <Text className="text-xs text-neutral-500 mt-1">
                  {recentReservations.length} pending
                </Text>
              </View>
            </View>

            <Text className="text-white text-lg font-semibold mb-4">
              Pending Reservation Rides
            </Text>
            {isSyncingNewPendingReservation ? (
              <View className="flex-row items-center gap-2 mb-3">
                <ActivityIndicator size="small" color="#a3a3a3" />
                <Text className="text-xs text-neutral-400">Adding new request...</Text>
              </View>
            ) : null}
            <View className="mb-8">
              {isLoadingRecentReservations && recentReservations.length === 0 ? (
                <View className="bg-neutral-900 rounded-2xl px-5 py-5 border border-neutral-800">
                  <Text className="text-neutral-400 text-sm text-center">
                    Loading pending rides...
                  </Text>
                </View>
              ) : recentReservations.length === 0 ? (
                <View className="bg-neutral-900 rounded-2xl px-5 py-5 border border-neutral-800">
                  <Text className="text-neutral-400 text-sm text-center">
                    No pending reservation rides right now.
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {recentReservations.map((reservation) => {
                    const isAccepting = acceptingReservationId === reservation.id;
                    const isAccepted = acceptedReservationIds.includes(reservation.id);
                    const estimatedTripMinutes = estimateTripDurationMinutes(
                      reservation.pickupLocation,
                      reservation.dropoffLocation,
                    );

                    return (
                      <PendingReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        estimatedTripMinutes={estimatedTripMinutes}
                        isAccepting={isAccepting}
                        isAccepted={isAccepted}
                        onAccept={() => {
                          setAcceptingReservationId(reservation.id);
                          setTimeout(() => {
                            setAcceptingReservationId(null);
                            setAcceptedReservationIds((prev) =>
                              prev.includes(reservation.id) ? prev : [...prev, reservation.id],
                            );
                            Alert.alert(
                              "Ride accepted",
                              "This ride is marked accepted in the UI. Backend assignment wiring is next.",
                            );
                          }, 500);
                        }}
                      />
                    );
                  })}
                </View>
              )}
            </View>

            <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
              <Text className="text-white text-base font-semibold mb-2">Coming Next</Text>
              <Text className="text-neutral-400 text-sm">
                Request queue, accept/decline actions, and earnings history.
              </Text>
            </View>
          </>
        ) : (
          <>
            {activeReservationForTimeline ? (
              <ReservationProgressTimeline
                reservation={activeReservationForTimeline}
                isCancelingReservation={isCancelingReservation}
                onCancelReservation={onCancelReservation}
              />
            ) : null}
            <TripSearchCard quickAction={quickAction} onNavigate={onNavigate} />
            <QuickActionRow
              quickAction={quickAction}
              onQuickActionChange={setQuickAction}
              onNavigate={onNavigate}
            />
            <NearbyDriversCard />

            <Text className="text-white text-lg font-semibold mb-4">Recent Trips</Text>
            <RecentActivityList
              reservations={recentActivityReservations}
              isLoading={isLoadingRecentReservations}
              onSelectReservation={setSelectedReservationId}
            />
          </>
        )}
      </ScrollView>

      <ReservationDetailsModal
        reservation={selectedReservation}
        isCancelingReservation={isCancelingReservation}
        onRequestClose={() => setSelectedReservationId(null)}
        onCancelReservation={onCancelReservation}
      />
    </SafeAreaView>
  );
}
