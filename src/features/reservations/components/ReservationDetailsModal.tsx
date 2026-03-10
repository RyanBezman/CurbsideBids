import { Alert, Modal, Pressable } from "react-native";
import {
  canCancelReservationStatus,
  type ReservationRecord,
} from "@domain/reservations";
import { RIDE_OPTION_BY_TYPE } from "@domain/ride";
import { useReservationBidSelection } from "@features/reservations/hooks";
import { ReservationDetailsContent } from "./ReservationDetailsContent";

type ReservationDetailsModalProps = {
  reservation: ReservationRecord | null;
  isCancelingReservation: boolean;
  onRefreshReservations?: () => Promise<void>;
  onRequestClose: () => void;
  onCancelReservation: (id: string) => Promise<void>;
};

export function ReservationDetailsModal({
  reservation,
  isCancelingReservation,
  onRefreshReservations,
  onRequestClose,
  onCancelReservation,
}: ReservationDetailsModalProps) {
  const rideImage = reservation ? RIDE_OPTION_BY_TYPE[reservation.rideType].source : null;
  const canCancel = reservation ? canCancelReservationStatus(reservation.status) : false;
  const { bids, isLoadingBids, isSelectingBidId, loadError, onSelectBid } =
    useReservationBidSelection({
      reservation,
      onBidSelected: async () => {
        await onRefreshReservations?.();
      },
    });

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

  const handleSelectBid = (bidId: string) => {
    if (!reservation) return;

    Alert.alert(
      "Choose driver",
      "Selecting a bid ends the open bidding for this ride.",
      [
        { text: "Keep browsing", style: "cancel" },
        {
          text: "Choose driver",
          onPress: () => {
            void (async () => {
              try {
                await onSelectBid(bidId);
                Alert.alert(
                  "Driver selected",
                  "Your ride has been matched. We'll keep the status updated here.",
                );
                onRequestClose();
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Unable to select this driver right now.";
                Alert.alert("Selection failed", message);
              }
            })();
          },
        },
      ],
    );
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
              bids={bids}
              canCancel={canCancel}
              isCancelingReservation={isCancelingReservation}
              isLoadingBids={isLoadingBids}
              isSelectingBidId={isSelectingBidId}
              loadError={loadError}
              onConfirmCancelRide={handleConfirmCancelRide}
              onRequestClose={onRequestClose}
              onSelectBid={handleSelectBid}
              reservation={reservation}
              rideImage={rideImage}
            />
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
