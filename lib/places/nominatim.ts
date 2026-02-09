import type { PlaceSuggestion } from "./types";

type NominatimSearchItem = {
  place_id?: unknown;
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
};

function splitDisplayName(displayName: string): { title: string; subtitle?: string } {
  const parts = displayName.split(",").map((p) => p.trim()).filter(Boolean);
  const title = parts[0] ?? displayName;
  const subtitle = parts.length > 1 ? parts.slice(1).join(", ") : undefined;
  return { title, subtitle };
}

export async function nominatimSuggestPlaces(
  query: string,
  options: {
    signal?: AbortSignal;
    limit?: number;
    countryCodes?: string;
    language?: string;
  } = {},
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams();
  params.set("q", q);
  params.set("format", "jsonv2");
  params.set("addressdetails", "0");
  params.set("limit", String(options.limit ?? 6));
  params.set("countrycodes", options.countryCodes ?? "us");

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: "application/json",
      // Best-effort. Nominatim prefers identifiable clients; for production,
      // proxy this server-side so you can set a stable User-Agent/contact.
      "Accept-Language": options.language ?? "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Place search failed (${response.status})`);
  }

  const json = (await response.json()) as unknown;
  const items = Array.isArray(json) ? (json as unknown[]) : [];

  const out: PlaceSuggestion[] = [];
  for (const raw of items) {
    const item = raw as NominatimSearchItem;
    const displayName =
      typeof item.display_name === "string" ? item.display_name : undefined;
    if (!displayName) continue;

    const latitude = typeof item.lat === "string" ? Number(item.lat) : NaN;
    const longitude = typeof item.lon === "string" ? Number(item.lon) : NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const id =
      typeof item.place_id === "number" || typeof item.place_id === "string"
        ? String(item.place_id)
        : displayName;

    const { title, subtitle } = splitDisplayName(displayName);

    out.push({
      id,
      title,
      subtitle,
      label: displayName,
      location: { latitude, longitude },
    });
  }

  return out;
}

