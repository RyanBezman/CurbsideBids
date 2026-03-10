import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from "react-native";
import { BidAmountWheel } from "./BidAmountWheel";
import { formatBidAmount } from "./bidPricing";
type BidComposerPanelProps = {
  activeBidAmountCents: number;
  activeBidIndex: number;
  isNoteOpen: boolean;
  isSubmittingBid: boolean;
  maxFareCents: number | null;
  noteText: string;
  submissionError: string | null;
  suggestedBidAmountCents: number;
  tripBreakdownLabel: string;
  mileageComponentCents: number;
  timeComponentCents: number;
  hasExistingBid: boolean;
  wheelOptions: number[];
  onSetWheelRef: (scrollView: ScrollView | null) => void;
  onWheelEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onSelectWheelAmount: (amountCents: number, index: number, animated: boolean) => void;
  onDecreaseBid: () => void;
  onIncreaseBid: () => void;
  onToggleNote: () => void;
  onNoteChange: (value: string) => void;
  onSubmitBid: () => void;
};
type BidAmountSelectorCardProps = {
  activeBidAmountCents: number;
  activeBidIndex: number;
  isSubmittingBid: boolean;
  wheelOptions: number[];
  onSetWheelRef: (scrollView: ScrollView | null) => void;
  onWheelEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onSelectWheelAmount: (amountCents: number, index: number, animated: boolean) => void;
  onDecreaseBid: () => void;
  onIncreaseBid: () => void;
};
function BidAmountSelectorCard({
  activeBidAmountCents,
  activeBidIndex,
  isSubmittingBid,
  wheelOptions,
  onSetWheelRef,
  onWheelEnd,
  onSelectWheelAmount,
  onDecreaseBid,
  onIncreaseBid,
}: BidAmountSelectorCardProps) {
  return (
    <View className="mt-3 rounded-xl border border-neutral-700 bg-neutral-900 py-3">
      <Text className="text-center text-neutral-500 text-[10px] uppercase tracking-wide">Selected Bid</Text>
      <Text className="text-center text-white text-3xl font-semibold mt-1" testID="selected-bid-amount">
        {formatBidAmount(activeBidAmountCents)}
      </Text>
      <BidAmountWheel
        options={wheelOptions}
        activeIndex={activeBidIndex}
        onEndScroll={onWheelEnd}
        onRefReady={onSetWheelRef}
        onSelectAmount={onSelectWheelAmount}
      />
      <View className="mt-2 flex-row items-center justify-between px-2">
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmittingBid}
          onPress={onDecreaseBid}
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5"
        >
          <Text className="text-neutral-300 text-xs font-medium">- $1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmittingBid}
          onPress={onIncreaseBid}
          className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5"
        >
          <Text className="text-neutral-300 text-xs font-medium">+ $1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
type BidNoteSectionProps = {
  activeBidAmountCents: number;
  hasExistingBid: boolean;
  isNoteOpen: boolean;
  isSubmittingBid: boolean;
  noteText: string;
  submissionError: string | null;
  onToggleNote: () => void;
  onNoteChange: (value: string) => void;
  onSubmitBid: () => void;
};
function BidNoteSection({
  activeBidAmountCents,
  hasExistingBid,
  isNoteOpen,
  isSubmittingBid,
  noteText,
  submissionError,
  onToggleNote,
  onNoteChange,
  onSubmitBid,
}: BidNoteSectionProps) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isSubmittingBid}
        onPress={onToggleNote}
        className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2"
      >
        <Text className="text-neutral-300 text-xs font-medium">{isNoteOpen ? "Hide note" : "Add note (optional)"}</Text>
      </TouchableOpacity>
      {isNoteOpen ? (
        <TextInput
          value={noteText}
          onChangeText={onNoteChange}
          placeholder="Any details for the rider..."
          placeholderTextColor="#525252"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="mt-2 bg-neutral-900 rounded-xl px-4 py-3 text-white text-sm border border-neutral-800 min-h-[84px]"
          style={{ fontSize: 14 }}
          testID="bid-note-input"
        />
      ) : null}
      {submissionError ? (
        <Text className="text-rose-300 text-xs mt-2">{submissionError}</Text>
      ) : (
        <Text className="text-neutral-500 text-xs mt-2">Rider sees {formatBidAmount(activeBidAmountCents)}.</Text>
      )}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isSubmittingBid}
        onPress={onSubmitBid}
        className={`mt-3 rounded-xl py-2.5 items-center ${
          isSubmittingBid
            ? "bg-neutral-700 border border-neutral-600"
            : "bg-emerald-600 border border-emerald-500/80"
        }`}
        testID="submit-bid-button"
      >
        {isSubmittingBid ? (
          <ActivityIndicator color="#f8fafc" size="small" />
        ) : (
          <Text className="text-white text-sm font-semibold">{hasExistingBid ? "Save Bid Update" : "Submit Bid"}</Text>
        )}
      </TouchableOpacity>
    </>
  );
}
export function BidComposerPanel({
  activeBidAmountCents,
  activeBidIndex,
  hasExistingBid,
  isNoteOpen,
  isSubmittingBid,
  maxFareCents,
  noteText,
  submissionError,
  suggestedBidAmountCents,
  timeComponentCents,
  mileageComponentCents,
  tripBreakdownLabel,
  wheelOptions,
  onSetWheelRef,
  onWheelEnd,
  onSelectWheelAmount,
  onDecreaseBid,
  onIncreaseBid,
  onToggleNote,
  onNoteChange,
  onSubmitBid,
}: BidComposerPanelProps) {
  return (
    <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3" testID="bid-composer-panel">
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-sm font-semibold">Set your bid</Text>
        <Text className="text-neutral-500 text-[11px]">Scroll wheel to adjust</Text>
      </View>
      <Text className="text-neutral-500 text-xs mt-1">
        Start estimate {formatBidAmount(suggestedBidAmountCents)} using $1/mi + $0.50/min.
      </Text>
      {maxFareCents !== null ? (
        <Text className="text-amber-300 text-xs mt-1">
          Rider max {formatBidAmount(maxFareCents)}. Bids above this amount are blocked.
        </Text>
      ) : null}
      <Text className="text-neutral-600 text-[11px] mt-0.5">
        {tripBreakdownLabel} • {formatBidAmount(mileageComponentCents)} mileage +{" "}
        {formatBidAmount(timeComponentCents)} time
      </Text>
      <BidAmountSelectorCard
        activeBidAmountCents={activeBidAmountCents}
        activeBidIndex={activeBidIndex}
        isSubmittingBid={isSubmittingBid}
        wheelOptions={wheelOptions}
        onSetWheelRef={onSetWheelRef}
        onWheelEnd={onWheelEnd}
        onSelectWheelAmount={onSelectWheelAmount}
        onDecreaseBid={onDecreaseBid}
        onIncreaseBid={onIncreaseBid}
      />
      <BidNoteSection
        activeBidAmountCents={activeBidAmountCents}
        hasExistingBid={hasExistingBid}
        isNoteOpen={isNoteOpen}
        isSubmittingBid={isSubmittingBid}
        noteText={noteText}
        submissionError={submissionError}
        onToggleNote={onToggleNote}
        onNoteChange={onNoteChange}
        onSubmitBid={onSubmitBid}
      />
    </View>
  );
}
