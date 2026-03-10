import { Text } from "react-native";
import type { AppRouteName } from "@app/navigation";
import type { ReservationRecord } from "@domain/reservations";
import {
  NearbyDriversCard,
  QuickActionRow,
  ReservationProgressTimeline,
  TripSearchCard,
} from "@features/home/components";
import { RecentActivityList } from "@features/reservations/components";

type RiderHomeSectionProps = {
  activeReservationForTimeline: ReservationRecord | null;
  isCancelingReservation: boolean;
  isLoadingRecentReservations: boolean;
  onCancelReservation: (id: string) => Promise<void>;
  onNavigate: (route: AppRouteName) => void;
  onSelectActiveReservation: (id: string) => void;
  onSelectReservation: (id: string) => void;
  recentActivityReservations: ReservationRecord[];
};

export function RiderHomeSection({
  activeReservationForTimeline,
  isCancelingReservation,
  isLoadingRecentReservations,
  onCancelReservation,
  onNavigate,
  onSelectActiveReservation,
  onSelectReservation,
  recentActivityReservations,
}: RiderHomeSectionProps) {
  return (
    <>
      {activeReservationForTimeline ? (
        <ReservationProgressTimeline
          reservation={activeReservationForTimeline}
          isCancelingReservation={isCancelingReservation}
          onCancelReservation={onCancelReservation}
          onOpenDetails={onSelectActiveReservation}
        />
      ) : null}
      <TripSearchCard onNavigate={onNavigate} />
      <QuickActionRow onNavigate={onNavigate} />
      <NearbyDriversCard />

      <Text className="text-white text-lg font-semibold mb-4">Recent Trips</Text>
      <RecentActivityList
        reservations={recentActivityReservations}
        isLoading={isLoadingRecentReservations}
        onSelectReservation={onSelectReservation}
      />
    </>
  );
}
