export type LatLng = {
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = {
  /** Provider-specific identifier (ex: Mapbox feature id). */
  id: string;
  /** Primary label (ex: business name or street). */
  title: string;
  /** Secondary label (ex: city/state). */
  subtitle?: string;
  /** Full label suitable for writing into the input. */
  label: string;
  location: LatLng;
};

