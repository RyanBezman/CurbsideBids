import React from "react";
import { act, create } from "react-test-renderer";
import type { ReservationRecord } from "@domain/reservations";
import { PendingReservationCard } from "./PendingReservationCard";

function buildReservation(): ReservationRecord {
  return {
    id: "reservation-1",
    kind: "scheduled",
    status: "pending",
    driverId: null,
    selectedBidId: null,
    agreedFareCents: null,
    maxFareCents: 1800,
    rideType: "Economy",
    pickupLabel: "123 Main St",
    pickupLocation: null,
    dropoffLabel: "456 Oak St",
    dropoffLocation: null,
    scheduledAt: "2026-03-01T12:00:00.000Z",
    createdAt: "2026-03-01T10:00:00.000Z",
    canceledAt: null,
  };
}

describe("PendingReservationCard", () => {
  beforeAll(() => {
    global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      callback(0);
      return 0;
    };
  });

  it("opens and closes bid composer", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <PendingReservationCard
          reservation={buildReservation()}
          estimatedTripMinutes={15}
          existingBidAmountCents={null}
          existingBidNote={null}
          isLoadingExistingBid={false}
          isSubmittingBid={false}
          onSubmitBid={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(tree!.root.findAllByProps({ testID: "bid-composer-panel" }).length).toBe(0);

    act(() => {
      tree!.root.findByProps({ testID: "toggle-bid-composer" }).props.onPress();
    });

    expect(tree!.root.findAllByProps({ testID: "bid-composer-panel" }).length).toBeGreaterThan(0);

    act(() => {
      tree!.root.findByProps({ testID: "toggle-bid-composer" }).props.onPress();
    });

    expect(tree!.root.findAllByProps({ testID: "bid-composer-panel" }).length).toBe(0);
  });

  it("submits bid and closes composer on success", async () => {
    const onSubmitBid = jest.fn().mockResolvedValue(undefined);
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <PendingReservationCard
          reservation={buildReservation()}
          estimatedTripMinutes={15}
          existingBidAmountCents={null}
          existingBidNote={null}
          isLoadingExistingBid={false}
          isSubmittingBid={false}
          onSubmitBid={onSubmitBid}
        />,
      );
    });

    act(() => {
      tree!.root.findByProps({ testID: "toggle-bid-composer" }).props.onPress();
    });

    await act(async () => {
      await tree!.root.findByProps({ testID: "submit-bid-button" }).props.onPress();
    });

    expect(onSubmitBid).toHaveBeenCalled();
    expect(tree!.root.findAllByProps({ testID: "bid-composer-panel" }).length).toBe(0);
  });

  it("shows submission error if submit fails", async () => {
    const onSubmitBid = jest.fn().mockRejectedValue(new Error("Unable to place bid"));
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <PendingReservationCard
          reservation={buildReservation()}
          estimatedTripMinutes={15}
          existingBidAmountCents={null}
          existingBidNote={null}
          isLoadingExistingBid={false}
          isSubmittingBid={false}
          onSubmitBid={onSubmitBid}
        />,
      );
    });

    act(() => {
      tree!.root.findByProps({ testID: "toggle-bid-composer" }).props.onPress();
    });

    await act(async () => {
      await tree!.root.findByProps({ testID: "submit-bid-button" }).props.onPress();
    });

    const textNodes = tree!.root.findAll(
      (node) => node.type === "Text" && node.props.children === "Unable to place bid",
    );
    expect(textNodes.length).toBeGreaterThan(0);
  });

  it("clamps the suggested bid to the rider max budget", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <PendingReservationCard
          reservation={buildReservation()}
          estimatedTripMinutes={40}
          existingBidAmountCents={null}
          existingBidNote={null}
          isLoadingExistingBid={false}
          isSubmittingBid={false}
          onSubmitBid={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    act(() => {
      tree!.root.findByProps({ testID: "toggle-bid-composer" }).props.onPress();
    });

    expect(tree!.root.findByProps({ testID: "selected-bid-amount" }).props.children).toBe(
      "$18.00",
    );
  });
});
