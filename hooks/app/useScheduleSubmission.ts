import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { User } from "@supabase/supabase-js";
import { createScheduledReservation } from "../../lib/reservations";
import { formatScheduleForConfirmation } from "../../helpers/formatting/dateTime";
import type {
  LocationPoint,
} from "../../lib/places/locationPoint";
import type {
  RideType,
  ScheduledReservationInsertPayload,
  Screen,
} from "../../screens/types";

type UseScheduleSubmissionParams = {
  dropoff: string;
  dropoffLocation: LocationPoint | null;
  loadRecentReservations: (userId?: string) => Promise<void>;
  onNavigate: (screen: Screen) => void;
  pickup: string;
  pickupLocation: LocationPoint | null;
  rideType: RideType;
  scheduleDate: Date;
  setDropoff: (value: string) => void;
  setDropoffLocation: (value: LocationPoint | null) => void;
  setRideType: (value: RideType) => void;
  user: User | null;
};

function getZonedWallClockMillis(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value ?? "0");
  };

  return Date.UTC(
    partValue("year"),
    partValue("month") - 1,
    partValue("day"),
    partValue("hour"),
    partValue("minute"),
    partValue("second"),
  );
}

function getLeadTimeMillis(scheduleDate: Date, pickupTimeZone?: string): number {
  if (!pickupTimeZone) {
    return scheduleDate.getTime() - Date.now();
  }

  try {
    const nowZoned = getZonedWallClockMillis(new Date(), pickupTimeZone);
    const scheduledZoned = getZonedWallClockMillis(scheduleDate, pickupTimeZone);
    return scheduledZoned - nowZoned;
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
  rideType,
  scheduleDate,
  setDropoff,
  setDropoffLocation,
  setRideType,
  user,
}: UseScheduleSubmissionParams) {
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
      rideType,
      scheduledAtIso: scheduleDate.toISOString(),
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
          [{ text: "Continue", onPress: () => onNavigate("signin") }],
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
        `Your ${payload.rideType} ride is scheduled for ${formatScheduleForConfirmation(payload.scheduledAtIso)}.\n\n${payload.pickup} -> ${payload.dropoff}`,
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
