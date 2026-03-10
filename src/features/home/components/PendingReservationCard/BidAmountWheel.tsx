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

export const WHEEL_ITEM_HEIGHT = 56;
export const WHEEL_VIEWPORT_HEIGHT = 252;
export const WHEEL_CENTER_OFFSET = (WHEEL_VIEWPORT_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;

type BidAmountWheelProps = {
  options: number[];
  activeIndex: number;
  onSelectAmount: (amountCents: number, index: number, animated: boolean) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onRefReady: (scrollView: ScrollView | null) => void;
};

export function BidAmountWheel({
  options,
  activeIndex,
  onSelectAmount,
  onScroll,
  onEndScroll,
  onRefReady,
}: BidAmountWheelProps) {
  const localRef = useRef<ScrollView | null>(null);

  return (
    <View className="mt-4 items-center">
      <View
        className="relative w-full max-w-[176px] overflow-hidden rounded-[24px]"
        style={{ height: WHEEL_VIEWPORT_HEIGHT }}
      >
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 rounded-[28px] border border-white/8 bg-white/[0.03]"
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
          onScroll={onScroll}
          scrollEventThrottle={32}
          onMomentumScrollEnd={onEndScroll}
          contentContainerStyle={{
            paddingTop: WHEEL_CENTER_OFFSET,
            paddingBottom: WHEEL_CENTER_OFFSET,
          }}
        >
          {options.map((wheelAmountCents, index) => {
            const distanceFromActive = Math.abs(index - activeIndex);
            const opacity =
              distanceFromActive === 0 ? 1 : distanceFromActive === 1 ? 0.52 : 0.22;
            const scale =
              distanceFromActive === 0 ? 1 : distanceFromActive === 1 ? 0.94 : 0.88;

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
                style={{ height: WHEEL_ITEM_HEIGHT, opacity, transform: [{ scale }] }}
                className="items-center justify-center"
              >
                <Text
                  className={`font-semibold ${
                    distanceFromActive === 0
                      ? "text-4xl text-white"
                      : "text-2xl text-neutral-600"
                  }`}
                >
                  {formatBidAmount(wheelAmountCents)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
