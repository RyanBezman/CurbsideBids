import React from "react";
import { act, create } from "react-test-renderer";
import type { User } from "@supabase/supabase-js";
import type { ReservationRecord } from "@domain/reservations";
import { HomeScreenLoggedIn } from "./HomeScreenLoggedIn";

function buildReservation(overrides: Partial<ReservationRecord>): ReservationRecord {
  return {
    id: "reservation-1",
    kind: "scheduled",
    status: "pending",
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

function buildUser(id: string, role: "driver" | "rider"): User {
  return {
    id,
    email: `${role}@test.com`,
    user_metadata: {
      role,
      full_name: role,
    },
  } as unknown as User;
}

function hasText(tree: ReturnType<typeof create>, text: string): boolean {
  return (
    tree.root.findAll((node) => node.type === "Text" && node.props.children === text).length > 0
  );
}

describe("HomeScreenLoggedIn", () => {
  it("renders driver pending section", () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <HomeScreenLoggedIn
          user={buildUser("driver-1", "driver")}
          onSignOut={jest.fn()}
          onNavigate={jest.fn()}
          recentReservations={[]}
          isLoadingRecentReservations={false}
          isSyncingNewPendingReservation={false}
          isCancelingReservation={false}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(hasText(tree!, "Pending Reservation Rides")).toBe(true);
  });

  it("renders rider timeline and recent trips", () => {
    const reservations = [
      buildReservation({ status: "pending" }),
      buildReservation({ id: "reservation-2", status: "completed" }),
    ];

    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <HomeScreenLoggedIn
          user={buildUser("rider-1", "rider")}
          onSignOut={jest.fn()}
          onNavigate={jest.fn()}
          recentReservations={reservations}
          isLoadingRecentReservations={false}
          isSyncingNewPendingReservation={false}
          isCancelingReservation={false}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(hasText(tree!, "Ride Status")).toBe(true);
    expect(hasText(tree!, "Recent Trips")).toBe(true);
  });
});
