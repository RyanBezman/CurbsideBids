import type { ReservationRecord } from "../../screens/types";

export function getStatusClasses(status: ReservationRecord["status"]) {
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

  return {
    chip: "bg-rose-500/20 border-rose-400/40",
    text: "text-rose-300",
    dot: "bg-rose-400",
  };
}
