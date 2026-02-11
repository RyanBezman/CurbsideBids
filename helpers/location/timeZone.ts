import * as Location from "expo-location";

function pickTimeZone(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

/**
 * Best-effort timezone lookup from coordinates using reverse geocoding metadata.
 * Returns null if provider metadata doesn't include an IANA timezone id.
 */
export async function resolveTimeZoneForCoords(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = geocoded[0] as
      | (Location.LocationGeocodedAddress & {
          timezone?: unknown;
          timeZone?: unknown;
          ianaTimezone?: unknown;
        })
      | undefined;

    if (!first) return null;

    return (
      pickTimeZone(first.timezone) ??
      pickTimeZone(first.timeZone) ??
      pickTimeZone(first.ianaTimezone)
    );
  } catch {
    return null;
  }
}
