import { useRef } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { formatBidAmount } from "./bidPricing";

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_VIEWPORT_HEIGHT = 220;
export const WHEEL_CENTER_OFFSET = (WHEEL_VIEWPORT_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

type BidAmountWheelProps = {
  options: number[];
  activeIndex: number;
  onSelectAmount: (amountCents: number, index: number, animated: boolean) => void;
  onEndScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onRefReady: (scrollView: ScrollView | null) => void;
};

export function BidAmountWheel({
  options,
  activeIndex,
  onSelectAmount,
  onEndScroll,
  onRefReady,
}: BidAmountWheelProps) {
  const localRef = useRef<ScrollView | null>(null);

  return (
    <View className="mt-3 items-center">
      <View className="relative w-full max-w-[160px]" style={{ height: WHEEL_VIEWPORT_HEIGHT }}>
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 rounded-xl border border-emerald-400/35 bg-emerald-500/10"
          style={{
            top: WHEEL_CENTER_OFFSET,
            height: WHEEL_ITEM_HEIGHT,
            zIndex: 2,
          }}
        />
        <ScrollView
          ref={(instance) => {
            localRef.current = instance;
            onRefReady(instance);
          }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          snapToInterval={WHEEL_ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onEndScroll}
          contentContainerStyle={{
            paddingTop: WHEEL_CENTER_OFFSET,
            paddingBottom: WHEEL_CENTER_OFFSET,
          }}
        >
          {options.map((wheelAmountCents, index) => {
            const isSelected = index === activeIndex;

            return (
              <TouchableOpacity
                key={wheelAmountCents}
                activeOpacity={0.85}
                onPress={() => {
                  onSelectAmount(wheelAmountCents, index, true);
                  localRef.current?.scrollTo({
                    y: index * WHEEL_ITEM_HEIGHT,
                    animated: true,
                  });
                }}
                style={{ height: WHEEL_ITEM_HEIGHT }}
                className="justify-center"
              >
                <View
                  className={`mx-2 rounded-lg border py-2 ${
                    isSelected
                      ? "bg-emerald-600/20 border-emerald-400/60"
                      : "bg-neutral-950 border-neutral-700"
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      isSelected ? "text-emerald-200" : "text-neutral-300"
                    }`}
                  >
                    {formatBidAmount(wheelAmountCents)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
