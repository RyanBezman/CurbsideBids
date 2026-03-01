import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { useRecentReservations } from "@features/reservations";

export function useHomeFlow(user: User | null) {
  const {
    handleCancelReservation,
    isCancelingReservation,
    isLoadingRecentReservations,
    isSyncingNewPendingReservation,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  } = useRecentReservations(user);

  useEffect(() => {
    if (!user) {
      resetRecentReservations();
      return;
    }

    void loadRecentReservations(user.id);
  }, [loadRecentReservations, resetRecentReservations, user]);

  return {
    handleCancelReservation,
    isCancelingReservation,
    isLoadingRecentReservations,
    isSyncingNewPendingReservation,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  };
}
