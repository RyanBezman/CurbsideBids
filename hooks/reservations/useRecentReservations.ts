import { useCallback, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  cancelReservation,
  listPendingRideReservations,
  listRecentReservations,
} from "../../lib/reservations";
import type { ReservationRecord } from "../../screens/types";

function getUserRole(user: User | null): "rider" | "driver" {
  const rawRole = user?.user_metadata?.role;
  return rawRole === "driver" ? "driver" : "rider";
}

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
        const reservations =
          getUserRole(user) === "driver"
            ? await listPendingRideReservations(100)
            : await listRecentReservations(userId, 10);
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
      if (getUserRole(user) === "driver") {
        throw new Error("Drivers cannot cancel rider reservations.");
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
