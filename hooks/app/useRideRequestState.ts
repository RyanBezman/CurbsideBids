import { useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import type { PlaceSuggestion } from "../../lib/places/types";
import {
  locationPointFromDevice,
  locationPointFromSuggestion,
  type LocationPoint,
} from "../../lib/places/locationPoint";
import type { RideType } from "../../screens/types";
import { ensureForegroundLocationPermission } from "../../helpers/location/locationPermission";
import {
  formatPickupDisplayFromLocation,
  formatPickupFromLocation,
} from "../../helpers/location/locationFormatting";
import { resolveTimeZoneForCoords } from "../../helpers/location/timeZone";

export function useRideRequestState() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupLocation, setPickupLocation] = useState<LocationPoint | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<LocationPoint | null>(null);
  const [rideType, setRideType] = useState<RideType>("Economy");
  const [scheduleDate, setScheduleDate] = useState<Date>(() => {
    const value = new Date();
    value.setHours(value.getHours() + 1, 0, 0, 0);
    return value;
  });
  const [isResolvingPickupLocation, setIsResolvingPickupLocation] = useState(false);
  const isResolvingPickupLocationRef = useRef(false);
  const pickupTimeZoneCacheRef = useRef(new Map<string, string | null>());

  const pickupPlaceholder = useMemo(
    () => (isResolvingPickupLocation ? "Detecting current location..." : undefined),
    [isResolvingPickupLocation],
  );

  const handlePickupChange = (value: string) => {
    setPickup(value);
    setPickupLocation(null);
  };

  const handlePickupSelectSuggestion = (suggestion: PlaceSuggestion) => {
    const latitude = suggestion.location.latitude;
    const longitude = suggestion.location.longitude;
    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    const cachedTimeZone = pickupTimeZoneCacheRef.current.get(cacheKey);

    setPickupLocation(locationPointFromSuggestion(suggestion, cachedTimeZone ?? undefined));

    if (cachedTimeZone !== undefined) return;

    void (async () => {
      const timeZone = await resolveTimeZoneForCoords(latitude, longitude);
      pickupTimeZoneCacheRef.current.set(cacheKey, timeZone);
      setPickupLocation((previous) => {
        if (!previous) return previous;
        if (previous.latitude !== latitude || previous.longitude !== longitude) {
          return previous;
        }
        return {
          ...previous,
          timeZone: timeZone ?? undefined,
        };
      });
    })();
  };

  const handleDropoffChange = (value: string) => {
    setDropoff(value);
    setDropoffLocation(null);
  };

  const handleDropoffSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setDropoffLocation(locationPointFromSuggestion(suggestion));
  };

  const fillPickupFromCurrentLocation = async () => {
    if (isResolvingPickupLocationRef.current) return;

    isResolvingPickupLocationRef.current = true;
    setIsResolvingPickupLocation(true);

    try {
      const canUseLocation = await ensureForegroundLocationPermission();
      if (!canUseLocation) return;

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const pickupLabel = formatPickupFromLocation(currentLocation.coords, geocoded[0]);
      const pickupDisplay = formatPickupDisplayFromLocation(
        currentLocation.coords,
        geocoded[0],
      );

      let applied = false;
      setPickup((previous) => {
        if (previous.trim()) return previous;
        applied = true;
        return pickupDisplay;
      });

      if (applied) {
        const rawGeocoded = geocoded[0] as
          | (Location.LocationGeocodedAddress & {
              timezone?: unknown;
              timeZone?: unknown;
              ianaTimezone?: unknown;
            })
          | undefined;
        const timeZone =
          (typeof rawGeocoded?.timezone === "string" && rawGeocoded.timezone) ||
          (typeof rawGeocoded?.timeZone === "string" && rawGeocoded.timeZone) ||
          (typeof rawGeocoded?.ianaTimezone === "string" && rawGeocoded.ianaTimezone) ||
          undefined;

        setPickupLocation(
          locationPointFromDevice({
            label: pickupLabel,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            timeZone,
          }),
        );
      }
    } catch (error) {
      console.warn("Unable to auto-fill pickup from current location", error);
    } finally {
      setIsResolvingPickupLocation(false);
      isResolvingPickupLocationRef.current = false;
    }
  };

  return {
    dropoff,
    dropoffLocation,
    fillPickupFromCurrentLocation,
    handleDropoffChange,
    handleDropoffSelectSuggestion,
    handlePickupChange,
    handlePickupSelectSuggestion,
    pickup,
    pickupLocation,
    pickupPlaceholder,
    rideType,
    scheduleDate,
    setDropoff,
    setDropoffLocation,
    setRideType,
    setScheduleDate,
  };
}
