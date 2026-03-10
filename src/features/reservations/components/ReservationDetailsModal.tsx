import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import {
  canCancelReservationStatus,
  type ReservationRecord,
} from "@domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import {
  ReservationRoutePreview,
  ReservationStatusChip,
  ReservationVehicleThumb,
} from "@shared/ui";
import { formatDatetime } from "@features/reservations/lib";

type ReservationDetailsModalProps = {
  reservation: ReservationRecord | null;
  isCancelingReservation: boolean;
  onRequestClose: () => void;
  onCancelReservation: (id: string) => Promise<void>;
};

type ReservationDetailsContentProps = {
  canCancel: boolean;
  isCancelingReservation: boolean;
  onConfirmCancelRide: () => void;
  onRequestClose: () => void;
  reservation: ReservationRecord;
  rideImage: ImageSourcePropType;
};

function ReservationDetailsContent({
  canCancel,
  isCancelingReservation,
  onConfirmCancelRide,
  onRequestClose,
  reservation,
  rideImage,
}: ReservationDetailsContentProps) {
  return (
    <>
      <View className="mb-4 items-center">
        <View className="h-1 w-10 rounded-full bg-violet-500/40" />
      </View>

      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">Ride details</Text>
        <TouchableOpacity
          onPress={onRequestClose}
          disabled={isCancelingReservation}
          className="h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800"
        >
          <Text className="text-sm text-neutral-400">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-5 rounded-2xl border border-violet-500/15 bg-neutral-950 p-3">
        <ReservationVehicleThumb
          source={rideImage}
          containerClassName="h-28 w-full rounded-none bg-transparent"
          imageClassName="h-full w-full"
        />
      </View>

      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">{reservation.rideType}</Text>
        <ReservationStatusChip status={reservation.status} className="px-3" />
      </View>

      <View className="mb-4 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
        <View className="mr-3 h-2.5 w-2.5 rounded-full bg-amber-400" />
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-wide text-neutral-500">Scheduled for</Text>
          <Text className="mt-0.5 text-sm font-medium text-white">
            {formatDatetime(reservation.scheduledAt)}
          </Text>
        </View>
      </View>

      <View className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
        <Text className="text-xs uppercase tracking-wide text-neutral-500">Route</Text>
        <ReservationRoutePreview
          pickupLabel={reservation.pickupLabel}
          dropoffLabel={reservation.dropoffLabel}
          containerClassName="mt-2"
          pickupTextClassName="text-sm leading-5 text-white"
          dropoffTextClassName="text-sm leading-5 text-white mt-2"
        />
      </View>

      <View className="mt-4 px-1">
        <Text className="text-xs text-neutral-500 text-center">
          Booked {formatDatetime(reservation.createdAt)}
        </Text>
      </View>

      {canCancel ? (
        <TouchableOpacity
          onPress={onConfirmCancelRide}
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
              <Text className="text-center font-semibold text-rose-200">Canceling...</Text>
            </View>
          ) : (
            <Text className="text-center font-semibold text-rose-200">Cancel ride</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </>
  );
}

export function ReservationDetailsModal({
  reservation,
  isCancelingReservation,
  onRequestClose,
  onCancelReservation,
}: ReservationDetailsModalProps) {
  const rideImage = reservation ? RIDE_OPTION_BY_TYPE[reservation.rideType].source : null;
  const canCancel = reservation ? canCancelReservationStatus(reservation.status) : false;

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
                error instanceof Error ? error.message : "Unable to cancel this ride right now.";
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
          {reservation && rideImage ? (
            <ReservationDetailsContent
              canCancel={canCancel}
              isCancelingReservation={isCancelingReservation}
              onConfirmCancelRide={handleConfirmCancelRide}
              onRequestClose={onRequestClose}
              reservation={reservation}
              rideImage={rideImage}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
