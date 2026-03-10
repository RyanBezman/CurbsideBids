import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { User } from "@supabase/supabase-js";
import type { AppRouteName } from "../../../app/navigation";
import type {
  LocationPoint,
} from "../../../domain/location/locationPoint";
import type {
  RideType,
  ScheduledReservationInsertPayload,
} from "../../../domain";
import { createScheduledReservation } from "../../reservations";
import {
  formatScheduleForConfirmation,
  serializeWallClockDateForTimeZone,
} from "../../../shared/lib";

type UseScheduleSubmissionOptions = {
  dropoff: string;
  dropoffLocation: LocationPoint | null;
  loadRecentReservations: (userId?: string) => Promise<void>;
  onNavigate: (route: AppRouteName) => void;
  pickup: string;
  pickupLocation: LocationPoint | null;
  maxFareCents: number;
  rideType: RideType;
  scheduleDate: Date;
  setDropoff: (value: string) => void;
  setDropoffLocation: (value: LocationPoint | null) => void;
  setRideType: (value: RideType) => void;
  user: User | null;
};

function getLeadTimeMillis(scheduleDate: Date, pickupTimeZone?: string): number {
  if (!pickupTimeZone) {
    return scheduleDate.getTime() - Date.now();
  }

  try {
    return (
      new Date(
        serializeWallClockDateForTimeZone(scheduleDate, pickupTimeZone),
      ).getTime() - Date.now()
    );
  } catch {
    return scheduleDate.getTime() - Date.now();
  }
}

export function useScheduleSubmission({
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
}: UseScheduleSubmissionOptions) {
  const [isSchedulingRide, setIsSchedulingRide] = useState(false);
  const [pendingScheduleSubmission, setPendingScheduleSubmission] =
    useState<ScheduledReservationInsertPayload | null>(null);
  const pendingScheduleSubmissionRef =
    useRef<ScheduledReservationInsertPayload | null>(null);
  const isSubmittingScheduledReservationRef = useRef(false);

  useEffect(() => {
    pendingScheduleSubmissionRef.current = pendingScheduleSubmission;
  }, [pendingScheduleSubmission]);

  const buildScheduledReservationPayload = (): ScheduledReservationInsertPayload | null => {
    const trimmedPickup = pickup.trim();
    if (!trimmedPickup) {
      Alert.alert("Missing pickup", "Please enter a pickup location.");
      return null;
    }

    const trimmedDropoff = dropoff.trim();
    if (!trimmedDropoff) {
      Alert.alert("Missing dropoff", "Please enter a dropoff location.");
      return null;
    }

    if (!rideType) {
      Alert.alert("Missing ride type", "Please select a ride type.");
      return null;
    }
    if (!Number.isInteger(maxFareCents) || maxFareCents <= 0) {
      Alert.alert("Missing budget", "Please set the maximum amount you want to pay.");
      return null;
    }

    const leadTimeMillis = getLeadTimeMillis(scheduleDate, pickupLocation?.timeZone);
    if (leadTimeMillis < 60 * 60 * 1000) {
      Alert.alert(
        "Invalid schedule time",
        "Scheduled rides must be at least 1 hour from now at the pickup location.",
      );
      return null;
    }

    return {
      kind: "scheduled",
      pickup: trimmedPickup,
      dropoff: trimmedDropoff,
      pickupLocation,
      dropoffLocation,
      maxFareCents,
      rideType,
      scheduledAtIso: serializeWallClockDateForTimeZone(
        scheduleDate,
        pickupLocation?.timeZone,
      ),
    };
  };

  const submitScheduledReservation = async (
    payload: ScheduledReservationInsertPayload,
    options?: { fromPending?: boolean },
  ) => {
    if (isSubmittingScheduledReservationRef.current) return;

    if (!user) {
      if (!options?.fromPending) {
        setPendingScheduleSubmission(payload);
        Alert.alert(
          "Sign in required",
          "Sign in to schedule your ride. We'll submit it right after you sign in.",
          [{ text: "Continue", onPress: () => onNavigate("signIn") }],
        );
      }
      return;
    }

    isSubmittingScheduledReservationRef.current = true;
    setIsSchedulingRide(true);

    try {
      await createScheduledReservation(payload, user.id);
      setPendingScheduleSubmission(null);
      setDropoff("");
      setDropoffLocation(null);
      setRideType("Economy");
      await loadRecentReservations(user.id);
      Alert.alert(
        "Ride scheduled",
        `Your ${payload.rideType} ride is scheduled for ${formatScheduleForConfirmation(
          payload.scheduledAtIso,
          payload.pickupLocation?.timeZone,
        )}.\n\n${payload.pickup} -> ${payload.dropoff}`,
        [{ text: "OK", onPress: () => onNavigate("home") }],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to schedule your ride right now.";
      Alert.alert("Could not schedule ride", message);
      if (options?.fromPending) {
        setPendingScheduleSubmission(null);
        onNavigate("schedule");
      }
    } finally {
      isSubmittingScheduledReservationRef.current = false;
      setIsSchedulingRide(false);
    }
  };

  useEffect(() => {
    if (!user || !pendingScheduleSubmission) return;
    void submitScheduledReservation(pendingScheduleSubmission, {
      fromPending: true,
    });
  }, [user, pendingScheduleSubmission]);

  const handleScheduleFindRides = () => {
    const payload = buildScheduledReservationPayload();
    if (!payload) return;
    void submitScheduledReservation(payload);
  };

  const clearPendingScheduleSubmission = () => {
    setPendingScheduleSubmission(null);
  };

  return {
    clearPendingScheduleSubmission,
    handleScheduleFindRides,
    hasPendingScheduleSubmission: Boolean(pendingScheduleSubmission),
    isSchedulingRide,
    pendingScheduleSubmissionRef,
    submitScheduledReservation,
  };
}
