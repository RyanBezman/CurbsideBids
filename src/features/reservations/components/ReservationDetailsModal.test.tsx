import React from "react";
import { Alert } from "react-native";
import { act, create } from "react-test-renderer";
import type { ReservationRecord } from "@domain/reservations";
import { ReservationDetailsModal } from "./ReservationDetailsModal";

jest.mock("@features/reservations/hooks", () => ({
  useReservationBidSelection: jest.fn(),
}));

type MockReservationHooksModule = {
  useReservationBidSelection: jest.Mock;
};

function buildReservation(
  overrides: Partial<ReservationRecord> = {},
): ReservationRecord {
  return {
    id: "reservation-1",
    kind: "scheduled",
    status: "bid_selected",
    driverId: null,
    selectedBidId: null,
    activeBidCount: 0,
    lowestActiveBidAmountCents: null,
    agreedFareCents: null,
    maxFareCents: 2400,
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
  const { useReservationBidSelection } = jest.requireMock(
    "@features/reservations/hooks",
  ) as MockReservationHooksModule;

  beforeEach(() => {
    useReservationBidSelection.mockReset();
    useReservationBidSelection.mockReturnValue({
      bids: [],
      isLoadingBids: false,
      isSelectingBidId: null,
      loadError: null,
      onSelectBid: jest.fn(),
    });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows cancel action for bid-selected reservations", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ReservationDetailsModal
          reservation={buildReservation()}
          isCancelingReservation={false}
          onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
          onRequestClose={jest.fn()}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(hasText(tree!, "Cancel ride")).toBe(true);
  });

  it("shows incoming driver bids for pending reservations", () => {
    useReservationBidSelection.mockReturnValue({
      bids: [
        {
          id: "bid-1",
          reservationId: "reservation-1",
          driverId: "driver-1",
          amountCents: 1850,
          etaMinutes: 12,
          note: "I can be there quickly.",
          status: "active",
          createdAt: "2026-03-01T10:05:00.000Z",
          updatedAt: "2026-03-01T10:05:00.000Z",
        },
      ],
      isLoadingBids: false,
      isSelectingBidId: null,
      loadError: null,
      onSelectBid: jest.fn(),
    });

    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ReservationDetailsModal
          reservation={buildReservation({ status: "pending" })}
          isCancelingReservation={false}
          onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
          onRequestClose={jest.fn()}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(hasText(tree!, "Driver bids")).toBe(true);
    expect(hasText(tree!, "$18.50")).toBe(true);
    expect(hasText(tree!, "Choose")).toBe(true);
  });
});
