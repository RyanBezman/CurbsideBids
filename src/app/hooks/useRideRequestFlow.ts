import { useCallback } from "react";
import { isRideRequestRoute, type AppRouteName } from "@app/navigation";
import { useRideRequestState } from "@features/ride-request";

export function useRideRequestFlow() {
  const rideRequestState = useRideRequestState();

  const primePickupForRoute = useCallback(
    (route: AppRouteName) => {
      if (isRideRequestRoute(route) && rideRequestState.pickup.trim().length === 0) {
        void rideRequestState.fillPickupFromCurrentLocation();
      }
    },
    [rideRequestState.fillPickupFromCurrentLocation, rideRequestState.pickup],
  );

  return {
    ...rideRequestState,
    primePickupForRoute,
  };
}
