import { ReservationRoutePreview } from "@shared/ui";

type PendingReservationRouteProps = {
  pickupLabel: string;
  dropoffLabel: string;
};

export function PendingReservationRoute({
  pickupLabel,
  dropoffLabel,
}: PendingReservationRouteProps) {
  return (
    <ReservationRoutePreview
      pickupLabel={pickupLabel}
      dropoffLabel={dropoffLabel}
      containerClassName="mt-3 ml-1"
    />
  );
}
