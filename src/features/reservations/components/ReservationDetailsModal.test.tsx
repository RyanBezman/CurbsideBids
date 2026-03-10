import React from "react";
import { act, create } from "react-test-renderer";
import type { ReservationRecord } from "@domain/reservations";
import { ReservationDetailsModal } from "./ReservationDetailsModal";

function buildReservation(
  overrides: Partial<ReservationRecord> = {},
): ReservationRecord {
  return {
    id: "reservation-1",
    kind: "scheduled",
    status: "bid_selected",
    driverId: null,
    selectedBidId: null,
    agreedFareCents: null,
    rideType: "Economy",
    pickupLabel: "Pickup",
    pickupLocation: null,
    dropoffLabel: "Dropoff",
    dropoffLocation: null,
    scheduledAt: "2026-03-01T12:00:00.000Z",
    createdAt: "2026-03-01T10:00:00.000Z",
    canceledAt: null,
    ...overrides,
  };
}

function hasText(tree: ReturnType<typeof create>, text: string): boolean {
  return (
    tree.root.findAll((node) => node.type === "Text" && node.props.children === text).length > 0
  );
}

describe("ReservationDetailsModal", () => {
  it("shows cancel action for bid-selected reservations", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ReservationDetailsModal
          reservation={buildReservation()}
          isCancelingReservation={false}
          onRequestClose={jest.fn()}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(hasText(tree!, "Cancel ride")).toBe(true);
  });
});
