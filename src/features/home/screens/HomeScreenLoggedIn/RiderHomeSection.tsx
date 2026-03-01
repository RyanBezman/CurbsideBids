import { Text } from "react-native";
import type { AppRouteName } from "@app/navigation";
import type { ReservationRecord } from "@domain/reservations";
import {
  NearbyDriversCard,
  QuickActionRow,
  ReservationProgressTimeline,
  TripSearchCard,
} from "@features/home/components";
import type { QuickAction } from "@features/home/types";
import { RecentActivityList } from "@features/reservations/components";

type RiderHomeSectionProps = {
  activeReservationForTimeline: ReservationRecord | null;
  isCancelingReservation: boolean;
  isLoadingRecentReservations: boolean;
  onCancelReservation: (id: string) => Promise<void>;
  onNavigate: (route: AppRouteName) => void;
  onQuickActionChange: (next: QuickAction) => void;
  onSelectReservation: (id: string) => void;
  quickAction: QuickAction | null;
  recentActivityReservations: ReservationRecord[];
};

export function RiderHomeSection({
  activeReservationForTimeline,
  isCancelingReservation,
  isLoadingRecentReservations,
  onCancelReservation,
  onNavigate,
  onQuickActionChange,
  onSelectReservation,
  quickAction,
  recentActivityReservations,
}: RiderHomeSectionProps) {
  return (
    <>
      {activeReservationForTimeline ? (
        <ReservationProgressTimeline
          reservation={activeReservationForTimeline}
          isCancelingReservation={isCancelingReservation}
          onCancelReservation={onCancelReservation}
        />
      ) : null}
      <TripSearchCard quickAction={quickAction} onNavigate={onNavigate} />
      <QuickActionRow
        quickAction={quickAction}
        onQuickActionChange={onQuickActionChange}
        onNavigate={onNavigate}
      />
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
