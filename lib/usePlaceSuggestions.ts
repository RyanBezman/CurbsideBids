import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import type { PlaceSuggestion } from "./places/types";
import { nominatimSuggestPlaces } from "./places/nominatim";

type Options = {
  enabled?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
};

export function usePlaceSuggestions(query: string, options: Options = {}) {
  const enabled = options.enabled ?? true;
  const debounceMs = options.debounceMs ?? 400;
  const minQueryLength = options.minQueryLength ?? 3;

  const trimmed = query.trim();
  const debouncedQuery = useDebouncedValue(trimmed, debounceMs);

  const cacheRef = useRef(new Map<string, PlaceSuggestion[]>());
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      setSearchedQuery(null);
      return;
    }

    if (debouncedQuery.length < minQueryLength) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      setSearchedQuery(null);
      return;
    }

    const cacheKey = debouncedQuery.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
      setError(null);
      setSearchedQuery(debouncedQuery);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSearchedQuery(debouncedQuery);

    nominatimSuggestPlaces(debouncedQuery, {
      limit: 6,
      signal: controller.signal,
    })
      .then((results) => {
        cacheRef.current.set(cacheKey, results);
        setSuggestions(results);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "";
        if (message.includes("Place search failed")) {
          // Avoid noisy provider errors while typing; keep prior results visible.
          setError(null);
          return;
        }
        setError("Unable to search places");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => controller.abort();
  }, [
    debouncedQuery,
    enabled,
    minQueryLength,
  ]);

  return { suggestions, loading, error, searchedQuery };
}
