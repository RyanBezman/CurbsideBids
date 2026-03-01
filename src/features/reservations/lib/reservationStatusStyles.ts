import type { ReservationStatus } from "@domain/reservations";

export function getStatusClasses(status: ReservationStatus) {
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
