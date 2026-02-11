import type { PlaceSuggestion } from "./types";

export type LocationPoint = {
  label: string;
  latitude: number;
  longitude: number;
  /** IANA timezone id when available (ex: America/New_York). */
  timeZone?: string;
  /** Provider-specific id (ex: Nominatim place_id). */
  providerId?: string;
  provider: "nominatim" | "device";
};

export function locationPointFromSuggestion(
  suggestion: PlaceSuggestion,
  timeZone?: string,
): LocationPoint {
  return {
    label: suggestion.label,
    latitude: suggestion.location.latitude,
    longitude: suggestion.location.longitude,
    timeZone,
    providerId: suggestion.id,
    provider: "nominatim",
  };
}

export function locationPointFromDevice(input: {
  label: string;
  latitude: number;
  longitude: number;
  timeZone?: string;
}): LocationPoint {
  return {
    label: input.label,
    latitude: input.latitude,
    longitude: input.longitude,
    timeZone: input.timeZone,
    provider: "device",
  };
}
