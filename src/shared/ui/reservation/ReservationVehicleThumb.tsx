import { Image, View, type ImageSourcePropType } from "react-native";

type ReservationVehicleThumbProps = {
  source: ImageSourcePropType | null | undefined;
  containerClassName?: string;
  imageClassName?: string;
};

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function ReservationVehicleThumb({
  source,
  containerClassName,
  imageClassName,
}: ReservationVehicleThumbProps) {
  if (!source) return null;

  return (
    <View
      className={joinClasses(
        "h-12 w-16 items-center justify-center rounded-xl bg-neutral-800",
        containerClassName,
      )}
    >
      <Image
        source={source}
        className={joinClasses("h-8 w-14", imageClassName)}
        resizeMode="contain"
      />
    </View>
  );
}
