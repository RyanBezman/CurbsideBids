import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import type { User } from "@supabase/supabase-js";
import {
  NearbyDriversCard,
  ProfileCard,
  QuickActionRow,
  RecentActivityList,
  ReservationDetailsModal,
  TripSearchCard,
  type QuickAction,
} from "../components";
import type { ReservationRecord, Screen } from "./types";

type Props = {
  user: User;
  onSignOut: () => void;
  onNavigate: (screen: Screen) => void;
  recentReservations: ReservationRecord[];
  isLoadingRecentReservations: boolean;
  isCancelingReservation: boolean;
  onCancelReservation: (id: string) => Promise<void>;
};

function getUserRole(user: User): "rider" | "driver" {
  const rawRole = user.user_metadata?.role;
  return rawRole === "driver" ? "driver" : "rider";
}

export function HomeScreenLoggedIn({
  user,
  onSignOut,
  onNavigate,
  recentReservations,
  isLoadingRecentReservations,
  isCancelingReservation,
  onCancelReservation,
}: Props) {
  const role = getUserRole(user);
  const isDriver = role === "driver";
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);

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

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="flex-1 px-5 pt-6">
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
            <View className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 border border-neutral-800">
              <Text className="text-white text-base font-semibold mb-1">Driver Dashboard</Text>
              <Text className="text-neutral-400 text-sm">
                Driver tools are being rolled out in phases. You are set up as a driver account.
              </Text>
            </View>

            <View className="flex-row gap-3 mb-8">
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">🚘</Text>
                <Text className="font-semibold text-sm text-neutral-300">Availability</Text>
                <Text className="text-xs text-neutral-500 mt-1">Offline</Text>
              </View>
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">📋</Text>
                <Text className="font-semibold text-sm text-neutral-300">Requests</Text>
                <Text className="text-xs text-neutral-500 mt-1">0 pending</Text>
              </View>
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
            <TripSearchCard quickAction={quickAction} onNavigate={onNavigate} />
            <QuickActionRow
              quickAction={quickAction}
              onQuickActionChange={setQuickAction}
              onNavigate={onNavigate}
            />
            <NearbyDriversCard />

            <Text className="text-white text-lg font-semibold mb-4">Recent Activity</Text>
            <RecentActivityList
              reservations={recentReservations}
              isLoading={isLoadingRecentReservations}
              onSelectReservation={setSelectedReservationId}
            />
          </>
        )}
      </View>

      <ReservationDetailsModal
        reservation={selectedReservation}
        isCancelingReservation={isCancelingReservation}
        onRequestClose={() => setSelectedReservationId(null)}
        onCancelReservation={onCancelReservation}
      />
    </SafeAreaView>
  );
}
