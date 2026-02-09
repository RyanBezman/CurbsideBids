import type { PlaceSuggestion } from "./types";

export type LocationPoint = {
  label: string;
  latitude: number;
  longitude: number;
  /** Provider-specific id (ex: Nominatim place_id). */
  providerId?: string;
  provider: "nominatim" | "device";
};

export function locationPointFromSuggestion(
  suggestion: PlaceSuggestion,
): LocationPoint {
  return {
    label: suggestion.label,
    latitude: suggestion.location.latitude,
    longitude: suggestion.location.longitude,
    providerId: suggestion.id,
    provider: "nominatim",
  };
}

export function locationPointFromDevice(input: {
  label: string;
  latitude: number;
  longitude: number;
}): LocationPoint {
  return {
    label: input.label,
    latitude: input.latitude,
    longitude: input.longitude,
    provider: "device",
  };
}
