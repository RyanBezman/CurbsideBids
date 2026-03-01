import React from "react";
import { act, create } from "react-test-renderer";
import { ReservationRoutePreview } from "./ReservationRoutePreview";
import {
  getReservationStatusClasses,
  ReservationStatusChip,
} from "./ReservationStatusChip";

describe("shared reservation ui", () => {
  it("renders pickup and dropoff labels", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <ReservationRoutePreview pickupLabel="Pickup St" dropoffLabel="Dropoff Ave" />,
      );
    });

    const pickupNodes = tree!.root.findAll(
      (node) => node.type === "Text" && node.props.children === "Pickup St",
    );
    const dropoffNodes = tree!.root.findAll(
      (node) => node.type === "Text" && node.props.children === "Dropoff Ave",
    );

    expect(pickupNodes.length).toBeGreaterThan(0);
    expect(dropoffNodes.length).toBeGreaterThan(0);
  });

  it("maps pending status to amber style classes", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(<ReservationStatusChip status="pending" testID="status-chip" />);
    });

    const pendingLabel = tree!.root.findAll(
      (node) => node.type === "Text" && node.props.children === "Pending",
    );
    const classes = getReservationStatusClasses("pending");

    expect(pendingLabel.length).toBeGreaterThan(0);
    expect(classes.chip).toContain("amber");
  });
});
