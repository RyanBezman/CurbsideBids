import type { PlaceSuggestion } from "./types";

/**
 * Convert a verbose provider label (ex: Nominatim display_name) into a compact label
 * for the input field. Keep it readable but not overly verbose.
 *
 * Default: "title, city" if we can infer city from subtitle; else just title.
 */
export function formatSuggestionDisplayLabel(s: PlaceSuggestion): string {
  const title = s.title?.trim() || s.label?.trim();
  if (!title) return "";

  const subtitle = s.subtitle?.trim();
  if (!subtitle) return title;

  const cityish = subtitle.split(",")[0]?.trim();
  if (!cityish) return title;

  // Avoid "Main St, Main St" duplication if subtitle starts with the same string.
  if (cityish.toLowerCase() === title.toLowerCase()) return title;

  return `${title}, ${cityish}`;
}
