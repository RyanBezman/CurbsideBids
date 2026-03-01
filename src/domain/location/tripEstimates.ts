import type { LocationPoint } from "./locationPoint";

const EARTH_RADIUS_KM = 6371;
const ROAD_DISTANCE_MULTIPLIER = 1.28;
const AVERAGE_CITY_SPEED_KMH = 30;
const PICKUP_AND_DROPOFF_BUFFER_MINUTES = 4;
const MINIMUM_TRIP_DURATION_MINUTES = 5;
const KM_TO_MILES = 0.621371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function greatCircleDistanceKm(start: LocationPoint, end: LocationPoint): number {
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(end.latitude);
  const latDelta = lat2 - lat1;
  const lonDelta = toRadians(end.longitude - start.longitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_KM * centralAngle;
}

export function estimateTripDurationMinutes(
  pickup: LocationPoint | null,
  dropoff: LocationPoint | null,
): number | null {
  if (!pickup || !dropoff) return null;

  const straightLineKm = greatCircleDistanceKm(pickup, dropoff);
  if (!Number.isFinite(straightLineKm)) return null;

  const routeKm = Math.max(0.2, straightLineKm * ROAD_DISTANCE_MULTIPLIER);
  const driveMinutes = (routeKm / AVERAGE_CITY_SPEED_KMH) * 60;
  const totalMinutes = driveMinutes + PICKUP_AND_DROPOFF_BUFFER_MINUTES;

  return Math.max(MINIMUM_TRIP_DURATION_MINUTES, Math.round(totalMinutes));
}

export function estimateTripDistanceMiles(
  pickup: LocationPoint | null,
  dropoff: LocationPoint | null,
): number | null {
  if (!pickup || !dropoff) return null;

  const straightLineKm = greatCircleDistanceKm(pickup, dropoff);
  if (!Number.isFinite(straightLineKm)) return null;

  const routeKm = Math.max(0.2, straightLineKm * ROAD_DISTANCE_MULTIPLIER);
  return routeKm * KM_TO_MILES;
}
