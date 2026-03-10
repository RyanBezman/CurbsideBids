import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from "react-native";
import { BidAmountWheel } from "./BidAmountWheel";
import { formatBidAmount } from "./bidPricing";

type BidComposerPanelProps = {
  activeBidAmountCents: number;
  activeBidIndex: number;
  onRequestClose: () => void;
  isNoteOpen: boolean;
  isSubmittingBid: boolean;
  maxFareCents: number | null;
  noteText: string;
  submissionError: string | null;
  suggestedBidAmountCents: number;
  hasExistingBid: boolean;
  wheelOptions: number[];
  onSetWheelRef: (scrollView: ScrollView | null) => void;
  onWheelScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onWheelEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onSelectWheelAmount: (amountCents: number, index: number, animated: boolean) => void;
  onToggleNote: () => void;
  onNoteChange: (value: string) => void;
  onSubmitBid: () => void;
};

export function BidComposerPanel({
  activeBidAmountCents,
  activeBidIndex,
  hasExistingBid,
  isNoteOpen,
  isSubmittingBid,
  maxFareCents,
  noteText,
  onRequestClose,
  submissionError,
  suggestedBidAmountCents,
  wheelOptions,
  onSetWheelRef,
  onWheelScroll,
  onWheelEnd,
  onSelectWheelAmount,
  onToggleNote,
  onNoteChange,
  onSubmitBid,
}: BidComposerPanelProps) {
  return (
    <View
      className="rounded-t-3xl border-t border-neutral-800 bg-neutral-950 px-5 pb-8 pt-3"
      testID="bid-composer-panel"
    >
      <View className="items-center">
        <View className="h-1.5 w-12 rounded-full bg-neutral-700" />
      </View>

      <View className="mt-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            Bid amount
          </Text>
          <Text className="mt-1 text-5xl font-semibold text-white" testID="selected-bid-amount">
            {formatBidAmount(activeBidAmountCents)}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            {maxFareCents !== null ? (
              <Text className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
                Max {formatBidAmount(maxFareCents)}
              </Text>
            ) : null}
            <Text className="text-xs text-neutral-500">
              {hasExistingBid
                ? "Scroll to update."
                : `Start from ${formatBidAmount(suggestedBidAmountCents)}.`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmittingBid}
          onPress={onRequestClose}
          className="rounded-full border border-neutral-700 px-3 py-2"
          testID="close-bid-composer"
        >
          <Text className="text-xs font-medium text-neutral-300">Close</Text>
        </TouchableOpacity>
      </View>

      <BidAmountWheel
        options={wheelOptions}
        activeIndex={activeBidIndex}
        onScroll={onWheelScroll}
        onEndScroll={onWheelEnd}
        onRefReady={onSetWheelRef}
        onSelectAmount={onSelectWheelAmount}
      />

      <View className="mt-4 flex-row items-center">
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isSubmittingBid}
          onPress={onToggleNote}
          className="rounded-full border border-neutral-700 px-3 py-2"
        >
          <Text className="text-xs font-medium text-neutral-300">
            {isNoteOpen ? "Hide note" : "Add note"}
          </Text>
        </TouchableOpacity>
      </View>

      {isNoteOpen ? (
        <TextInput
          value={noteText}
          onChangeText={onNoteChange}
          placeholder="Any details for the rider..."
          placeholderTextColor="#737373"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="mt-3 min-h-[84px] rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white"
          style={{ fontSize: 14 }}
          testID="bid-note-input"
        />
      ) : null}

      {submissionError ? (
        <Text className="mt-3 text-xs text-rose-300">{submissionError}</Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={isSubmittingBid}
        onPress={onSubmitBid}
        className={`mt-4 rounded-2xl py-3 items-center ${
          isSubmittingBid ? "bg-neutral-800" : "bg-white"
        }`}
        testID="submit-bid-button"
      >
        {isSubmittingBid ? (
          <ActivityIndicator color="#f8fafc" size="small" />
        ) : (
          <Text className="text-sm font-semibold text-neutral-950">
            {hasExistingBid ? "Save bid" : "Submit bid"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
