import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { LocationInput } from "./LocationInput";
import type { PlaceSuggestion } from "../../lib/places/types";
import { usePlaceSuggestions } from "../../lib/usePlaceSuggestions";
import { formatSuggestionDisplayLabel } from "../../lib/places/formatSuggestionDisplay";

type Props = {
  variant: "pickup" | "dropoff";
  value: string;
  onChangeText: (v: string) => void;
  onSelectSuggestion?: (suggestion: PlaceSuggestion) => void;
  /** Defaults to a shortened label to keep the input readable. */
  formatDisplayValue?: (suggestion: PlaceSuggestion) => string;
  label?: string;
  placeholder?: string;
  inputAccessoryViewID?: string;
  debounceMs?: number;
  minQueryLength?: number;
};

function SuggestionRow({
  suggestion,
  onPress,
  showDivider,
}: {
  suggestion: PlaceSuggestion;
  onPress: () => void;
  showDivider: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-5 py-4 ${showDivider ? "border-t border-neutral-800" : ""}`}
    >
      <Text className="text-white text-base">{suggestion.title}</Text>
      {suggestion.subtitle ? (
        <Text className="text-neutral-400 text-sm mt-1">
          {suggestion.subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function LocationAutocompleteInput({
  variant,
  value,
  onChangeText,
  onSelectSuggestion,
  formatDisplayValue,
  label,
  placeholder,
  inputAccessoryViewID,
  debounceMs,
  minQueryLength,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSelectionLocked, setIsSelectionLocked] = useState(false);

  const minLen = minQueryLength ?? 3;
  const trimmed = useMemo(() => value.trim(), [value]);
  const shouldFetch = isFocused && !isSelectionLocked;

  const { suggestions, loading, error, searchedQuery } = usePlaceSuggestions(
    trimmed,
    {
    enabled: shouldFetch,
    debounceMs,
    minQueryLength: minLen,
    },
  );

  const handleChangeText = (next: string) => {
    setIsSelectionLocked(false);
    onChangeText(next);
  };

  const handleSelect = (suggestion: PlaceSuggestion) => {
    setIsSelectionLocked(true);
    const nextValue = (formatDisplayValue ?? formatSuggestionDisplayLabel)(
      suggestion,
    );
    onChangeText(nextValue || suggestion.title || suggestion.label);
    onSelectSuggestion?.(suggestion);
    // Return to the blurred/preview state after picking a suggestion.
    inputRef.current?.blur();
    Keyboard.dismiss();
    setIsFocused(false);
  };

  const showResults =
    isFocused &&
    !isSelectionLocked &&
    (loading ||
      Boolean(error) ||
      suggestions.length > 0 ||
      Boolean(searchedQuery));

  return (
    <View>
      <LocationInput
        ref={inputRef}
        variant={variant}
        value={value}
        onChangeText={handleChangeText}
        label={label}
        placeholder={placeholder}
        inputAccessoryViewID={inputAccessoryViewID}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {showResults ? (
        <View className="-mt-3 mb-5 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          {loading ? (
            <View className="px-5 py-4 flex-row items-center">
              <ActivityIndicator color="#a3a3a3" />
              <Text className="text-neutral-300 ml-3">Searching...</Text>
            </View>
          ) : null}

          {error ? (
            <View className="px-5 py-4">
              <Text className="text-rose-300">{error}</Text>
            </View>
          ) : null}

          {!loading && !error && Boolean(searchedQuery) && suggestions.length === 0 ? (
            <View className="px-5 py-4">
              <Text className="text-neutral-400">No results</Text>
            </View>
          ) : null}

          {suggestions.map((suggestion, index) => (
            <SuggestionRow
              key={suggestion.id}
              suggestion={suggestion}
              onPress={() => handleSelect(suggestion)}
              showDivider={index !== 0}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
