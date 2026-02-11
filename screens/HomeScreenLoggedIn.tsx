import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { User } from "@supabase/supabase-js";
import type { ReservationRecord, Screen } from "./types";
import { RIDE_OPTION_BY_TYPE } from "./rideOptions";

type QuickAction = "rides" | "package" | "scheduled";

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

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatusLabel(status: ReservationRecord["status"]): string {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  return "Canceled";
}

function getStatusClasses(status: ReservationRecord["status"]) {
  if (status === "pending") {
    return {
      chip: "bg-amber-500/20 border-amber-400/40",
      text: "text-amber-300",
      dot: "bg-amber-400",
    };
  }
  if (status === "accepted") {
    return {
      chip: "bg-emerald-500/20 border-emerald-400/40",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    };
  }
  return {
    chip: "bg-rose-500/20 border-rose-400/40",
    text: "text-rose-300",
    dot: "bg-rose-400",
  };
}

function shortId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 8)}...`;
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
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(
    null,
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

  const handleConfirmCancelRide = (reservation: ReservationRecord) => {
    if (isCancelingReservation) return;

    Alert.alert(
      "Cancel ride",
      "Are you sure you want to cancel this ride?",
      [
        { text: "Keep ride", style: "cancel" },
        {
          text: "Cancel ride",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await onCancelReservation(reservation.id);
                setSelectedReservationId(null);
                Alert.alert("Ride canceled", "This reservation has been canceled.");
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Unable to cancel this ride right now.";
                Alert.alert("Cancel failed", message);
              }
            })();
          },
        },
      ],
    );
  };

  const renderRecentActivity = () => {
    if (isLoadingRecentReservations) {
      return (
        <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 items-center">
          <ActivityIndicator color="#a78bfa" />
          <Text className="text-neutral-400 text-sm mt-3">Loading activity...</Text>
        </View>
      );
    }

    if (recentReservations.length === 0) {
      return (
        <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
          <Text className="text-neutral-500 text-sm text-center">
            No recent rides yet
          </Text>
        </View>
      );
    }

    return (
      <View className="gap-2">
        {recentReservations.map((reservation) => {
          const statusClasses = getStatusClasses(reservation.status);
          return (
            <TouchableOpacity
              key={reservation.id}
              onPress={() => setSelectedReservationId(reservation.id)}
              activeOpacity={0.8}
              className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <View className={`w-2 h-2 rounded-full ${statusClasses.dot}`} />
                  <Text className="text-white font-semibold text-sm">
                    {reservation.rideType}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full border ${statusClasses.chip}`}>
                  <Text className={`text-xs font-medium ${statusClasses.text}`}>
                    {formatStatusLabel(reservation.status)}
                  </Text>
                </View>
              </View>

              <Text className="text-neutral-300 text-sm">{formatDatetime(reservation.scheduledAt)}</Text>
              <Text className="text-neutral-500 text-xs mt-1" numberOfLines={1}>
                {reservation.pickupLabel}
                {" -> "}
                {reservation.dropoffLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const selectedRideImage =
    selectedReservation ? RIDE_OPTION_BY_TYPE[selectedReservation.rideType].source : null;
  const selectedStatusClasses = selectedReservation
    ? getStatusClasses(selectedReservation.status)
    : null;
  const canCancelSelectedReservation =
    selectedReservation?.status === "pending" ||
    selectedReservation?.status === "accepted";

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar style="light" />

      <View className="flex-1 px-5 pt-6">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">
              Curbside
            </Text>
            <Text className="text-sm text-neutral-500 mt-1">Welcome back!</Text>
          </View>
          <TouchableOpacity
            onPress={onSignOut}
            className="bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800"
          >
            <Text className="text-neutral-300 text-sm font-medium">Log Out</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-neutral-900 rounded-2xl p-5 mb-6 border border-neutral-800">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-violet-600 rounded-full items-center justify-center mr-4">
              <Text className="text-white text-xl font-bold">
                {(user.user_metadata?.full_name || user.email)
                  ?.charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">
                {user.user_metadata?.full_name || user.email}
              </Text>
              <Text className="text-neutral-500 text-sm">
                {isDriver ? "Driver" : "Rider"}
              </Text>
            </View>
          </View>
        </View>

        {isDriver ? (
          <>
            <View className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 border border-neutral-800">
              <Text className="text-white text-base font-semibold mb-1">
                Driver Dashboard
              </Text>
              <Text className="text-neutral-400 text-sm">
                Driver tools are being rolled out in phases. You are set up as a
                driver account.
              </Text>
            </View>

            <View className="flex-row gap-3 mb-8">
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">🚘</Text>
                <Text className="font-semibold text-sm text-neutral-300">
                  Availability
                </Text>
                <Text className="text-xs text-neutral-500 mt-1">Offline</Text>
              </View>
              <View className="flex-1 rounded-2xl py-5 items-center border bg-neutral-900 border-neutral-800">
                <Text className="text-xl mb-1">📋</Text>
                <Text className="font-semibold text-sm text-neutral-300">
                  Requests
                </Text>
                <Text className="text-xs text-neutral-500 mt-1">0 pending</Text>
              </View>
            </View>

            <View className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800">
              <Text className="text-white text-base font-semibold mb-2">
                Coming Next
              </Text>
              <Text className="text-neutral-400 text-sm">
                Request queue, accept/decline actions, and earnings history.
              </Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                if (quickAction === "package") onNavigate("package");
                else if (quickAction === "scheduled") onNavigate("schedule");
                else onNavigate("whereto");
              }}
              className="bg-neutral-900 rounded-2xl px-5 py-4 mb-6 flex-row items-center border border-neutral-800"
              activeOpacity={0.8}
            >
              <View className="w-3 h-3 rounded-full bg-violet-500 mr-4" />
              <Text className="text-neutral-400 text-base flex-1">Where to?</Text>
              <Text className="text-violet-400">→</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3 mb-8">
              <TouchableOpacity
                onPress={() => {
                  setQuickAction("rides");
                  onNavigate("whereto");
                }}
                activeOpacity={0.8}
                className={`flex-1 rounded-2xl py-5 items-center border ${
                  quickAction === "rides"
                    ? "bg-violet-600 border-violet-500"
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <Text className="text-xl mb-1">🚗</Text>
                <Text
                  className={`font-semibold text-sm ${
                    quickAction === "rides" ? "text-white" : "text-neutral-300"
                  }`}
                >
                  Ride
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setQuickAction("package");
                  onNavigate("package");
                }}
                activeOpacity={0.8}
                className={`flex-1 rounded-2xl py-5 items-center border ${
                  quickAction === "package"
                    ? "bg-violet-600 border-violet-500"
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <Text className="text-xl mb-1">📦</Text>
                <Text
                  className={`font-semibold text-sm ${
                    quickAction === "package" ? "text-white" : "text-neutral-300"
                  }`}
                >
                  Package
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setQuickAction("scheduled");
                  onNavigate("schedule");
                }}
                activeOpacity={0.8}
                className={`flex-1 rounded-2xl py-5 items-center border ${
                  quickAction === "scheduled"
                    ? "bg-violet-600 border-violet-500"
                    : "bg-neutral-900 border-neutral-800"
                }`}
              >
                <Text className="text-xl mb-1">📅</Text>
                <Text
                  className={`font-semibold text-sm ${
                    quickAction === "scheduled"
                      ? "text-white"
                      : "text-neutral-300"
                  }`}
                >
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-neutral-900 rounded-2xl p-4 mb-8 flex-row items-center border border-neutral-800">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-3" />
              <Text className="text-neutral-400 text-sm flex-1">
                <Text className="text-white font-semibold">247</Text> drivers nearby
              </Text>
              <Text className="text-violet-400 text-sm font-medium">
                ~3 min pickup
              </Text>
            </View>

            <Text className="text-white text-lg font-semibold mb-4">
              Recent Activity
            </Text>
            {renderRecentActivity()}
          </>
        )}
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={Boolean(selectedReservation)}
        onRequestClose={() => {
          if (isCancelingReservation) return;
          setSelectedReservationId(null);
        }}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => {
            if (isCancelingReservation) return;
            setSelectedReservationId(null);
          }}
        >
          <Pressable
            className="bg-neutral-900 rounded-t-3xl px-5 pt-5 pb-8 border-t border-neutral-700"
            onPress={() => {}}
          >
            {selectedReservation && selectedStatusClasses && selectedRideImage ? (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-xl font-semibold">Ride details</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (isCancelingReservation) return;
                      setSelectedReservationId(null);
                    }}
                    disabled={isCancelingReservation}
                    className="w-8 h-8 rounded-full bg-neutral-800 items-center justify-center"
                  >
                    <Text className="text-neutral-300 text-base">✕</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-semibold text-base">
                      {selectedReservation.rideType}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full border ${selectedStatusClasses.chip}`}
                    >
                      <Text className={`text-xs font-medium ${selectedStatusClasses.text}`}>
                        {formatStatusLabel(selectedReservation.status)}
                      </Text>
                    </View>
                  </View>

                  <Image
                    source={selectedRideImage}
                    className="w-full h-28 bg-neutral-900 rounded-xl mb-4"
                    resizeMode="contain"
                  />

                  <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
                    Scheduled for
                  </Text>
                  <Text className="text-white text-sm mb-3">
                    {formatDatetime(selectedReservation.scheduledAt)}
                  </Text>

                  <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
                    Pickup
                  </Text>
                  <Text className="text-white text-sm mb-3">
                    {selectedReservation.pickupLabel}
                  </Text>

                  <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
                    Dropoff
                  </Text>
                  <Text className="text-white text-sm mb-3">
                    {selectedReservation.dropoffLabel}
                  </Text>

                  <Text className="text-neutral-500 text-xs">
                    Reservation {shortId(selectedReservation.id)}
                  </Text>
                  <Text className="text-neutral-500 text-xs mt-1">
                    Booked {formatDatetime(selectedReservation.createdAt)}
                  </Text>
                </View>

                {isCancelingReservation ? (
                  <View className="mt-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                    <ActivityIndicator color="#fcd34d" size="small" />
                    <Text className="text-amber-200 text-sm">Canceling ride...</Text>
                  </View>
                ) : null}

                {canCancelSelectedReservation ? (
                  <TouchableOpacity
                    onPress={() => handleConfirmCancelRide(selectedReservation)}
                    disabled={isCancelingReservation}
                    className={`mt-4 rounded-2xl py-3 border ${
                      isCancelingReservation
                        ? "bg-rose-500/20 border-rose-500/30"
                        : "bg-rose-500/25 border-rose-400/50"
                    }`}
                  >
                    {isCancelingReservation ? (
                      <View className="flex-row items-center justify-center gap-2">
                        <ActivityIndicator color="#fda4af" size="small" />
                        <Text className="text-rose-200 text-center font-semibold">
                          Canceling...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-rose-200 text-center font-semibold">
                        Cancel ride
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
