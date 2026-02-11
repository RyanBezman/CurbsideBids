import { useCallback, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cancelReservation, listRecentReservations } from "../../lib/reservations";
import type { ReservationRecord } from "../../screens/types";

export function useRecentReservations(user: User | null) {
  const [recentReservations, setRecentReservations] = useState<ReservationRecord[]>([]);
  const [isLoadingRecentReservations, setIsLoadingRecentReservations] = useState(false);
  const [isCancelingReservation, setIsCancelingReservation] = useState(false);

  const loadRecentReservations = useCallback(
    async (targetUserId?: string) => {
      const userId = targetUserId ?? user?.id;
      if (!userId) {
        setRecentReservations([]);
        setIsLoadingRecentReservations(false);
        return;
      }

      setIsLoadingRecentReservations(true);

      try {
        const reservations = await listRecentReservations(userId, 10);
        setRecentReservations(reservations);
      } catch (error) {
        console.warn("Unable to load recent reservations", error);
        setRecentReservations([]);
      } finally {
        setIsLoadingRecentReservations(false);
      }
    },
    [user],
  );

  const handleCancelReservation = useCallback(
    async (reservationId: string) => {
      if (!user) {
        throw new Error("You need to be signed in to cancel a ride.");
      }

      setIsCancelingReservation(true);

      try {
        await cancelReservation(reservationId, user.id);
        await loadRecentReservations(user.id);
      } finally {
        setIsCancelingReservation(false);
      }
    },
    [loadRecentReservations, user],
  );

  const resetRecentReservations = useCallback(() => {
    setRecentReservations([]);
    setIsLoadingRecentReservations(false);
  }, []);

  return {
    handleCancelReservation,
    isCancelingReservation,
    isLoadingRecentReservations,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  };
}
