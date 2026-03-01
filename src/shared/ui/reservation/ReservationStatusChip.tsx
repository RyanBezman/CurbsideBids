import { Text, View } from "react-native";
import type { ReservationStatus } from "@domain/reservations";

type ReservationStatusClasses = {
  chip: string;
  text: string;
  dot: string;
};

type ReservationStatusChipProps = {
  status: ReservationStatus;
  className?: string;
  textClassName?: string;
  testID?: string;
};

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function getReservationStatusClasses(status: ReservationStatus): ReservationStatusClasses {
  if (status === "pending") {
    return {
      chip: "bg-amber-500/20 border-amber-400/40",
      text: "text-amber-300",
      dot: "bg-amber-400",
    };
  }

  if (status === "accepted") {
    return {
      chip: "bg-emerald-500/20 border-emerald-400/40",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    };
  }

  if (status === "bid_selected") {
    return {
      chip: "bg-sky-500/20 border-sky-400/40",
      text: "text-sky-300",
      dot: "bg-sky-400",
    };
  }

  if (status === "completed") {
    return {
      chip: "bg-violet-500/20 border-violet-400/40",
      text: "text-violet-300",
      dot: "bg-violet-400",
    };
  }

  if (status === "canceled") {
    return {
      chip: "bg-rose-500/20 border-rose-400/40",
      text: "text-rose-300",
      dot: "bg-rose-400",
    };
  }

  return {
    chip: "bg-neutral-600/20 border-neutral-500/40",
    text: "text-neutral-300",
    dot: "bg-neutral-400",
  };
}

export function formatReservationStatusLabel(status: ReservationStatus): string {
  if (status === "pending") return "Pending";
  if (status === "bid_selected") return "Bid Selected";
  if (status === "accepted") return "Accepted";
  if (status === "completed") return "Completed";
  if (status === "canceled") return "Canceled";
  return "In progress";
}

export function ReservationStatusChip({
  status,
  className,
  textClassName,
  testID,
}: ReservationStatusChipProps) {
  const statusClasses = getReservationStatusClasses(status);

  return (
    <View
      testID={testID}
      className={joinClasses(
        "rounded-full border px-2.5 py-1",
        statusClasses.chip,
        className,
      )}
    >
      <Text className={joinClasses("text-xs font-medium", statusClasses.text, textClassName)}>
        {formatReservationStatusLabel(status)}
      </Text>
    </View>
  );
}
