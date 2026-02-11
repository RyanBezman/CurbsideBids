import type { PlaceSuggestion } from "./types";

type NominatimSearchItem = {
  place_id?: unknown;
  display_name?: unknown;
  lat?: unknown;
  lon?: unknown;
  address?: unknown;
};

type NominatimAddress = Partial<{
  house_number: unknown;
  road: unknown;
  neighbourhood: unknown;
  suburb: unknown;
  city: unknown;
  town: unknown;
  village: unknown;
  hamlet: unknown;
  county: unknown;
  state: unknown;
  postcode: unknown;
  country: unknown;
}>;

function pickFirstString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function parseAddress(raw: unknown): NominatimAddress | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as NominatimAddress;
}

function formatTitleFromAddress(
  displayName: string,
  address: NominatimAddress | null,
): string {
  const partsFromDisplay = displayName
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const fallback = partsFromDisplay[0] ?? displayName;
  if (!address) return fallback;

  const house = pickFirstString(address.house_number);
  const road = pickFirstString(address.road);

  if (house && road) return `${house} ${road}`;
  if (road) return road;

  return fallback;
}

function formatSubtitleFromAddress(address: NominatimAddress | null): string | undefined {
  if (!address) return undefined;

  const cityish = pickFirstString(
    address.city,
    address.town,
    address.village,
    address.hamlet,
    address.suburb,
    address.neighbourhood,
  );
  const state = pickFirstString(address.state);
  const postcode = pickFirstString(address.postcode);
  const country = pickFirstString(address.country);

  const out: string[] = [];
  if (cityish) out.push(cityish);
  if (state) out.push(state);
  if (postcode) out.push(postcode);
  // Keep country last; often redundant, but useful outside US.
  if (country) out.push(country);

  return out.length ? out.join(", ") : undefined;
}

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

  const limit = options.limit ?? 6;
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("format", "jsonv2");
  params.set("addressdetails", "1");
  params.set("dedupe", "1");
  params.set("limit", String(limit));
  if (options.countryCodes) {
    params.set("countrycodes", options.countryCodes);
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const headers = {
    Accept: "application/json",
    "Accept-Language": options.language ?? "en",
  };

  const firstResponse = await fetch(url, {
    signal: options.signal,
    headers,
  });

  let response = firstResponse;
  // Single quick retry for transient upstream overload.
  if (!response.ok && (response.status === 429 || response.status === 503)) {
    response = await fetch(url, {
      signal: options.signal,
      headers,
    });
  }

  // Nominatim can transiently throttle; treat it as empty results to avoid
  // surfacing hard errors while user is typing.
  if (!response.ok) {
    if (response.status === 429 || response.status === 503) {
      return [];
    }
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

    const address = parseAddress(item.address);
    const title = formatTitleFromAddress(displayName, address);
    const subtitle =
      formatSubtitleFromAddress(address) ?? splitDisplayName(displayName).subtitle;

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
