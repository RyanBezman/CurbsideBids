import type { AppRouteName } from "@app/navigation";
import { useAuthFlow } from "@features/auth";

type UseAuthFlowBindingsOptions = {
  onNavigate: (route: AppRouteName) => void;
  clearPendingScheduleSubmission: () => void;
  resetRecentReservations: () => void;
};

export function useAuthFlowBindings({
  clearPendingScheduleSubmission,
  onNavigate,
  resetRecentReservations,
}: UseAuthFlowBindingsOptions) {
  return useAuthFlow({
    onNavigate,
    onSignedOut: () => {
      clearPendingScheduleSubmission();
      resetRecentReservations();
    },
  });
}
