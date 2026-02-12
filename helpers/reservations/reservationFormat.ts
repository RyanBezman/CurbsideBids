import type { ReservationRecord } from "../../screens/types";

export function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatStatusLabel(status: ReservationRecord["status"]): string {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  if (status === "completed") return "Completed";
  return "Canceled";
}

export function shortId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 8)}...`;
}
