import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  UIManager,
} from "react-native";
import type { User } from "@supabase/supabase-js";
import type { AppRouteName } from "@app/navigation";
import {
  isActiveReservationStatus,
  type ReservationRecord,
} from "@domain/reservations";
import { getUserRole } from "@domain/user";
import { ProfileCard } from "@features/home/components";
import type { QuickAction } from "@features/home/types";
import { ReservationDetailsModal } from "@features/reservations";
import { DriverHomeSection } from "./DriverHomeSection";
import { HomeTopBar } from "./HomeTopBar";
import { RiderHomeSection } from "./RiderHomeSection";

type HomeScreenLoggedInProps = {
  user: User;
  onSignOut: () => void;
  onNavigate: (route: AppRouteName) => void;
  onRefreshReservations: () => Promise<void>;
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
  onRefreshReservations,
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
  const previousReservationIdsRef = useRef<string[]>([]);

  const activeReservationForTimeline = useMemo(
    () => recentReservations.find((reservation) => isActiveReservationStatus(reservation.status)) ?? null,
    [recentReservations],
  );

  const recentActivityReservations = useMemo(
    () =>
      recentReservations.filter(
        (reservation) => !isActiveReservationStatus(reservation.status),
      ),
    [recentReservations],
  );

  const selectedReservation = useMemo(
    () =>
      recentReservations.find((reservation) => reservation.id === selectedReservationId) ?? null,
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

    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
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
        <HomeTopBar onSignOut={onSignOut} subtitle="Welcome back!" />

        <ProfileCard user={user} isDriver={isDriver} />

        {isDriver ? (
          <DriverHomeSection
            recentReservations={recentReservations}
            userId={user.id}
            isLoadingRecentReservations={isLoadingRecentReservations}
            isSyncingNewPendingReservation={isSyncingNewPendingReservation}
          />
        ) : (
          <RiderHomeSection
            activeReservationForTimeline={activeReservationForTimeline}
            isCancelingReservation={isCancelingReservation}
            isLoadingRecentReservations={isLoadingRecentReservations}
            onCancelReservation={onCancelReservation}
            onNavigate={onNavigate}
            onQuickActionChange={setQuickAction}
            onSelectActiveReservation={setSelectedReservationId}
            onSelectReservation={setSelectedReservationId}
            quickAction={quickAction}
            recentActivityReservations={recentActivityReservations}
          />
        )}
      </ScrollView>

      <ReservationDetailsModal
        reservation={selectedReservation}
        isCancelingReservation={isCancelingReservation}
        onRefreshReservations={onRefreshReservations}
        onRequestClose={() => setSelectedReservationId(null)}
        onCancelReservation={onCancelReservation}
      />
    </SafeAreaView>
  );
}
