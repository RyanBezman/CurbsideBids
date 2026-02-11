import { LocationAutocompleteInput } from "../ui";
import type { PlaceSuggestion } from "../../lib/places/types";

type Props = {
  pickup: string;
  pickupPlaceholder?: string;
  dropoff: string;
  onPickupChange: (value: string) => void;
  onPickupSelectSuggestion?: (suggestion: PlaceSuggestion) => void;
  onDropoffChange: (value: string) => void;
  onDropoffSelectSuggestion?: (suggestion: PlaceSuggestion) => void;
  inputAccessoryViewID?: string;
};

export function LocationSection({
  pickup,
  pickupPlaceholder,
  dropoff,
  onPickupChange,
  onPickupSelectSuggestion,
  onDropoffChange,
  onDropoffSelectSuggestion,
  inputAccessoryViewID,
}: Props) {
  return (
    <>
      <LocationAutocompleteInput
        variant="pickup"
        value={pickup}
        placeholder={pickupPlaceholder}
        onChangeText={onPickupChange}
        onSelectSuggestion={onPickupSelectSuggestion}
        inputAccessoryViewID={inputAccessoryViewID}
      />
      <LocationAutocompleteInput
        variant="dropoff"
        value={dropoff}
        onChangeText={onDropoffChange}
        onSelectSuggestion={onDropoffSelectSuggestion}
        inputAccessoryViewID={inputAccessoryViewID}
      />
    </>
  );
}
