import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  cancelReservation,
  listPendingRideReservations,
  listRecentReservations,
} from "../../lib/reservations";
import { supabase } from "../../lib/supabase";
import type { ReservationRecord } from "../../screens/types";

function getUserRole(user: User | null): "rider" | "driver" {
  const rawRole = user?.user_metadata?.role;
  return rawRole === "driver" ? "driver" : "rider";
}

type RealtimeReservationRow = {
  user_id?: string | null;
  kind?: string | null;
  status?: string | null;
};

type LoadRecentReservationsOptions = {
  showLoading?: boolean;
};

function getReservationRow(value: unknown): RealtimeReservationRow {
  if (!value || typeof value !== "object") return {};

  return value as RealtimeReservationRow;
}

export function useRecentReservations(user: User | null) {
  const [recentReservations, setRecentReservations] = useState<ReservationRecord[]>([]);
  const [isLoadingRecentReservations, setIsLoadingRecentReservations] = useState(false);
  const [isCancelingReservation, setIsCancelingReservation] = useState(false);
  const [isSyncingNewPendingReservation, setIsSyncingNewPendingReservation] = useState(false);

  const loadRecentReservations = useCallback(
    async (
      targetUserId?: string,
      options: LoadRecentReservationsOptions = { showLoading: true },
    ) => {
      const userId = targetUserId ?? user?.id;
      const showLoading = options.showLoading ?? true;
      if (!userId) {
        setRecentReservations([]);
        setIsLoadingRecentReservations(false);
        return;
      }

      if (showLoading) {
        setIsLoadingRecentReservations(true);
      }

      try {
        const reservations =
          getUserRole(user) === "driver"
            ? await listPendingRideReservations(100)
            : await listRecentReservations(userId, 10);
        setRecentReservations(reservations);
      } catch (error) {
        console.warn("Unable to load recent reservations", error);
        if (showLoading) {
          setRecentReservations([]);
        }
      } finally {
        if (showLoading) {
          setIsLoadingRecentReservations(false);
        }
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user?.id) return;

    const isDriver = getUserRole(user) === "driver";

    const channel = supabase
      .channel(`reservations-feed-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          const previous = getReservationRow(payload.old);
          const next = getReservationRow(payload.new);
          const isPendingRideInsert =
            payload.eventType === "INSERT" &&
            next.status === "pending" &&
            (next.kind === "ride" || next.kind === "scheduled");

          const touchesUserReservation =
            previous.user_id === user.id || next.user_id === user.id;
          const touchesDriverPendingReservation =
            (previous.status === "pending" &&
              (previous.kind === "ride" || previous.kind === "scheduled")) ||
            (next.status === "pending" && (next.kind === "ride" || next.kind === "scheduled"));

          if ((isDriver && touchesDriverPendingReservation) || touchesUserReservation) {
            if (isDriver && isPendingRideInsert) {
              setIsSyncingNewPendingReservation(true);
            }

            void loadRecentReservations(user.id, { showLoading: false }).finally(() => {
              if (isDriver && isPendingRideInsert) {
                setIsSyncingNewPendingReservation(false);
              }
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRecentReservations, user]);

  useEffect(() => {
    if (!user?.id) return;
    if (getUserRole(user) !== "driver") return;

    const intervalId = setInterval(() => {
      void loadRecentReservations(user.id, { showLoading: false });
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadRecentReservations, user]);

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
    isSyncingNewPendingReservation,
    loadRecentReservations,
    recentReservations,
    resetRecentReservations,
  };
}
