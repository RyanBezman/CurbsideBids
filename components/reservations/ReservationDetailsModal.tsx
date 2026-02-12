import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ReservationRecord } from "../../screens/types";
import { RIDE_OPTION_BY_TYPE } from "../../constants/rideOptions";
import {
  formatDatetime,
  formatStatusLabel,
} from "../../helpers/reservations/reservationFormat";
import { getStatusClasses } from "../../helpers/reservations/statusStyles";

type Props = {
  reservation: ReservationRecord | null;
  isCancelingReservation: boolean;
  onRequestClose: () => void;
  onCancelReservation: (id: string) => Promise<void>;
};

export function ReservationDetailsModal({
  reservation,
  isCancelingReservation,
  onRequestClose,
  onCancelReservation,
}: Props) {
  const rideImage = reservation
    ? RIDE_OPTION_BY_TYPE[reservation.rideType].source
    : null;
  const statusClasses = reservation
    ? getStatusClasses(reservation.status)
    : null;
  const canCancel =
    reservation?.status === "pending" || reservation?.status === "accepted";

  const handleConfirmCancelRide = () => {
    if (!reservation || isCancelingReservation) return;

    Alert.alert("Cancel ride", "Are you sure you want to cancel this ride?", [
      { text: "Keep ride", style: "cancel" },
      {
        text: "Cancel ride",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await onCancelReservation(reservation.id);
              onRequestClose();
              Alert.alert(
                "Ride canceled",
                "This reservation has been canceled.",
              );
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
    ]);
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={Boolean(reservation)}
      onRequestClose={() => {
        if (isCancelingReservation) return;
        onRequestClose();
      }}
    >
      <Pressable
        className="flex-1 justify-end bg-black/60"
        onPress={() => {
          if (isCancelingReservation) return;
          onRequestClose();
        }}
      >
        <Pressable
          className="rounded-t-3xl border-t border-violet-500/20 bg-neutral-900 px-5 pb-8 pt-3"
          onPress={() => {}}
        >
          {reservation && statusClasses && rideImage ? (
            <>
              {/* ── Drag handle ── */}
              <View className="mb-4 items-center">
                <View className="h-1 w-10 rounded-full bg-violet-500/40" />
              </View>

              {/* ── Header: title + close ── */}
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-white">
                  Ride details
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isCancelingReservation) return;
                    onRequestClose();
                  }}
                  disabled={isCancelingReservation}
                  className="h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800"
                >
                  <Text className="text-sm text-neutral-400">✕</Text>
                </TouchableOpacity>
              </View>

              {/* ── Hero image ── */}
              <View className="mb-5 rounded-2xl border border-violet-500/15 bg-neutral-950 p-3">
                <Image
                  source={rideImage}
                  className="h-28 w-full"
                  resizeMode="contain"
                />
              </View>

              {/* ── Ride type + status row ── */}
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-white">
                  {reservation.rideType}
                </Text>
                <View
                  className={`rounded-full border px-3 py-1 ${statusClasses.chip}`}
                >
                  <Text
                    className={`text-xs font-medium ${statusClasses.text}`}
                  >
                    {formatStatusLabel(reservation.status)}
                  </Text>
                </View>
              </View>

              {/* ── Schedule ── */}
              <View className="mb-4 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <View className="mr-3 h-2.5 w-2.5 rounded-full bg-amber-400" />
                <View className="flex-1">
                  <Text className="text-xs uppercase tracking-wide text-neutral-500">
                    Scheduled for
                  </Text>
                  <Text className="mt-0.5 text-sm font-medium text-white">
                    {formatDatetime(reservation.scheduledAt)}
                  </Text>
                </View>
              </View>

              {/* ── Route timeline (pickup → dropoff) ── */}
              <View className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                {/* Pickup */}
                <View className="flex-row">
                  <View className="mr-3 items-center pt-2">
                    <View className="h-3 w-3 rounded-full border-2 border-green-500 bg-green-500/30" />
                    <View className="my-1 w-0.5 flex-1 bg-neutral-700" />
                  </View>
                  <View className="flex-1 pb-4">
                    <Text className="text-xs uppercase tracking-wide text-neutral-500">
                      Pickup
                    </Text>
                    <Text className="mt-0.5 text-sm leading-5 text-white">
                      {reservation.pickupLabel}
                    </Text>
                  </View>
                </View>

                {/* Dropoff */}
                <View className="flex-row">
                  <View className="mr-3 items-center pt-2">
                    <View className="h-3 w-3 rounded-full border-2 border-violet-500 bg-violet-500/30" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs uppercase tracking-wide text-neutral-500">
                      Dropoff
                    </Text>
                    <Text className="mt-0.5 text-sm leading-5 text-white">
                      {reservation.dropoffLabel}
                    </Text>
                  </View>
                </View>
              </View>

              {/* ── Footer: booked date ── */}
              <View className="mt-4 px-1">
                <Text className="text-xs text-neutral-500 text-center">
                  Booked {formatDatetime(reservation.createdAt)}
                </Text>
              </View>

              {/* ── Cancel button ── */}
              {canCancel ? (
                <TouchableOpacity
                  onPress={handleConfirmCancelRide}
                  disabled={isCancelingReservation}
                  className={`mt-5 rounded-2xl border py-3.5 ${
                    isCancelingReservation
                      ? "border-rose-500/25 bg-rose-500/10"
                      : "border-rose-400/45 bg-rose-500/15"
                  }`}
                >
                  {isCancelingReservation ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator color="#fda4af" size="small" />
                      <Text className="text-center font-semibold text-rose-200">
                        Canceling...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-center font-semibold text-rose-200">
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
  );
}
