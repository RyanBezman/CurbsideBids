import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { ReservationBidRecord } from "@domain/reservations";

function formatBidAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

type BidRowProps = {
  bid: ReservationBidRecord;
  isSelecting: boolean;
  onSelect: () => void;
};

function BidRow({ bid, isSelecting, onSelect }: BidRowProps) {
  return (
    <View className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm font-semibold text-white">{formatBidAmount(bid.amountCents)}</Text>
          <Text className="mt-0.5 text-xs text-neutral-500">
            {bid.etaMinutes === null ? "ETA unavailable" : `ETA ${bid.etaMinutes} min`}
          </Text>
        </View>
        {bid.status === "selected" ? (
          <View className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1">
            <Text className="text-xs font-medium text-emerald-200">Selected</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onSelect}
            disabled={isSelecting}
            className={`rounded-xl px-4 py-2 ${isSelecting ? "bg-violet-500/40" : "bg-violet-600"}`}
          >
            {isSelecting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-sm font-semibold text-white">Choose</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {bid.note?.trim() ? (
        <Text className="mt-3 text-sm leading-5 text-neutral-300">{bid.note}</Text>
      ) : null}
    </View>
  );
}

type ReservationBidSectionProps = {
  bids: ReservationBidRecord[];
  isLoadingBids: boolean;
  isSelectingBidId: string | null;
  loadError: string | null;
  onSelectBid: (bidId: string) => void;
};

export function ReservationBidSection({
  bids,
  isLoadingBids,
  isSelectingBidId,
  loadError,
  onSelectBid,
}: ReservationBidSectionProps) {
  return (
    <View className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-white">Driver bids</Text>
        <Text className="text-xs text-neutral-500">
          {bids.length === 0 ? "Waiting for offers" : `${bids.length} available`}
        </Text>
      </View>

      {isLoadingBids ? (
        <View className="mt-4 flex-row items-center gap-2">
          <ActivityIndicator color="#a3a3a3" size="small" />
          <Text className="text-sm text-neutral-400">Loading bids...</Text>
        </View>
      ) : null}

      {!isLoadingBids && loadError ? (
        <Text className="mt-4 text-sm leading-5 text-rose-300">{loadError}</Text>
      ) : null}

      {!isLoadingBids && !loadError && bids.length === 0 ? (
        <Text className="mt-4 text-sm leading-5 text-neutral-400">
          Drivers can bid on this ride while it remains pending. New offers will appear here automatically.
        </Text>
      ) : null}

      {!isLoadingBids && !loadError && bids.length > 0 ? (
        <View className="mt-1">
          {bids.map((bid) => (
            <BidRow
              key={bid.id}
              bid={bid}
              isSelecting={isSelectingBidId === bid.id}
              onSelect={() => onSelectBid(bid.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
