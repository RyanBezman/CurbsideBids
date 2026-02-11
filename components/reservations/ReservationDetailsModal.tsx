import { ActivityIndicator, Alert, Image, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import type { ReservationRecord } from "../../screens/types";
import { RIDE_OPTION_BY_TYPE } from "../../constants/rideOptions";
import {
  formatDatetime,
  formatStatusLabel,
  shortId,
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
  const rideImage = reservation ? RIDE_OPTION_BY_TYPE[reservation.rideType].source : null;
  const statusClasses = reservation ? getStatusClasses(reservation.status) : null;
  const canCancel = reservation?.status === "pending" || reservation?.status === "accepted";

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
        className="flex-1 bg-black/60 justify-end"
        onPress={() => {
          if (isCancelingReservation) return;
          onRequestClose();
        }}
      >
        <Pressable
          className="bg-neutral-900 rounded-t-3xl px-5 pt-5 pb-8 border-t border-neutral-700"
          onPress={() => {}}
        >
          {reservation && statusClasses && rideImage ? (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-semibold">Ride details</Text>
                <TouchableOpacity
                  onPress={() => {
                    if (isCancelingReservation) return;
                    onRequestClose();
                  }}
                  disabled={isCancelingReservation}
                  className="w-8 h-8 rounded-full bg-neutral-800 items-center justify-center"
                >
                  <Text className="text-neutral-300 text-base">✕</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-base">{reservation.rideType}</Text>
                  <View className={`px-2 py-1 rounded-full border ${statusClasses.chip}`}>
                    <Text className={`text-xs font-medium ${statusClasses.text}`}>
                      {formatStatusLabel(reservation.status)}
                    </Text>
                  </View>
                </View>

                <Image
                  source={rideImage}
                  className="w-full h-28 bg-neutral-900 rounded-xl mb-4"
                  resizeMode="contain"
                />

                <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">
                  Scheduled for
                </Text>
                <Text className="text-white text-sm mb-3">{formatDatetime(reservation.scheduledAt)}</Text>

                <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Pickup</Text>
                <Text className="text-white text-sm mb-3">{reservation.pickupLabel}</Text>

                <Text className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Dropoff</Text>
                <Text className="text-white text-sm mb-3">{reservation.dropoffLabel}</Text>

                <Text className="text-neutral-500 text-xs">Reservation {shortId(reservation.id)}</Text>
                <Text className="text-neutral-500 text-xs mt-1">
                  Booked {formatDatetime(reservation.createdAt)}
                </Text>
              </View>

              {isCancelingReservation ? (
                <View className="mt-4 bg-amber-500/15 border border-amber-400/30 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                  <ActivityIndicator color="#fcd34d" size="small" />
                  <Text className="text-amber-200 text-sm">Canceling ride...</Text>
                </View>
              ) : null}

              {canCancel ? (
                <TouchableOpacity
                  onPress={handleConfirmCancelRide}
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
                      <Text className="text-rose-200 text-center font-semibold">Canceling...</Text>
                    </View>
                  ) : (
                    <Text className="text-rose-200 text-center font-semibold">Cancel ride</Text>
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
