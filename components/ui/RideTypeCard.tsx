import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Animated,
  Easing,
} from "react-native";
import type { RideType } from "../../screens/types";

type Props = {
  type: RideType;
  source: ImageSourcePropType;
  minsAway: string;
  arrival: string;
  selected: boolean;
  onSelect: () => void;
  /** Override displayed label (e.g. "Package") instead of type */
  label?: string;
  loading?: boolean;
};

type SkeletonBlockProps = {
  className: string;
  shimmerValue: Animated.Value;
};

function SkeletonBlock({ className, shimmerValue }: SkeletonBlockProps) {
  const [width, setWidth] = useState(0);
  const shimmerWidth = Math.max(width * 0.35, 28);
  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, width + shimmerWidth],
  });

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      className={`relative overflow-hidden bg-neutral-800/80 ${className}`}
    >
      {width > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: shimmerWidth,
            transform: [{ translateX }],
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      ) : null}
    </View>
  );
}

function useShimmerValue() {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    shimmerValue.setValue(0);
    const animation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerValue]);

  return shimmerValue;
}

function RideTypeCardSkeleton() {
  const shimmerValue = useShimmerValue();

  return (
    <View className="flex-row items-center rounded-2xl overflow-hidden border bg-neutral-900 border-neutral-800">
      <View className="w-32 h-24 bg-neutral-900 px-3 py-3 justify-between">
        <SkeletonBlock
          className="h-3.5 w-10 rounded-full"
          shimmerValue={shimmerValue}
        />
        <View className="items-center">
          <SkeletonBlock
            className="h-7 w-20 rounded-2xl"
            shimmerValue={shimmerValue}
          />
        </View>
        <View className="flex-row justify-between">
          <SkeletonBlock
            className="h-2.5 w-6 rounded-full"
            shimmerValue={shimmerValue}
          />
          <SkeletonBlock
            className="h-2.5 w-6 rounded-full"
            shimmerValue={shimmerValue}
          />
        </View>
      </View>

      <View className="flex-1 ml-4 my-4">
        <SkeletonBlock
          className="h-4 w-24 rounded mb-2"
          shimmerValue={shimmerValue}
        />
        <SkeletonBlock
          className="h-3 w-20 rounded mb-1.5"
          shimmerValue={shimmerValue}
        />
        <SkeletonBlock
          className="h-3 w-28 rounded"
          shimmerValue={shimmerValue}
        />
      </View>

      <View className="mr-4">
        <SkeletonBlock
          className="w-6 h-6 rounded-full"
          shimmerValue={shimmerValue}
        />
      </View>
    </View>
  );
}

export function RideTypeCard({
  type,
  source,
  minsAway,
  arrival,
  selected,
  onSelect,
  label,
  loading = false,
}: Props) {
  const displayLabel = label ?? type;

  if (loading) {
    return <RideTypeCardSkeleton />;
  }

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      className={`flex-row items-center rounded-2xl overflow-hidden border ${
        selected
          ? "bg-violet-600/20 border-violet-500"
          : "bg-neutral-900 border-neutral-800"
      }`}
    >
      <Image
        source={source}
        className="w-32 h-24 bg-neutral-800"
        resizeMode="contain"
      />
      <View className="flex-1 ml-4">
        <Text
          className={`font-semibold text-base ${
            selected ? "text-white" : "text-neutral-200"
          }`}
        >
          {displayLabel}
        </Text>
        <Text className="text-neutral-500 text-sm mt-0.5">{minsAway}</Text>
        <Text className="text-neutral-500 text-sm">{arrival}</Text>
      </View>
      {selected ? (
        <View className="w-6 h-6 rounded-full bg-violet-500 items-center justify-center mr-4">
          <Text className="text-white text-xs">✓</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
