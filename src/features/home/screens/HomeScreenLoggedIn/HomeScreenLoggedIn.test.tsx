import React from "react";
import { Alert } from "react-native";
import { act, create } from "react-test-renderer";
import type { User } from "@supabase/supabase-js";
import type { ReservationRecord } from "@domain/reservations";
import { HomeScreenLoggedIn } from "./HomeScreenLoggedIn";

jest.mock("./useDriverReservationBids", () => ({
  useDriverReservationBids: jest.fn(),
}));

type MockDriverReservationBidsModule = {
  useDriverReservationBids: jest.Mock;
};

function buildReservation(overrides: Partial<ReservationRecord>): ReservationRecord {
  return {
    id: "reservation-1",
    kind: "scheduled",
    status: "pending",
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

function renderHomeScreen({
  cancelingReservationId = null,
  recentReservations,
  user,
}: {
  cancelingReservationId?: string | null;
  recentReservations: ReservationRecord[];
  user: User;
}) {
  let tree: ReturnType<typeof create>;

  act(() => {
    tree = create(
      <HomeScreenLoggedIn
        user={user}
        onSignOut={jest.fn()}
        onNavigate={jest.fn()}
        onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
        recentReservations={recentReservations}
        cancelingReservationId={cancelingReservationId}
        isLoadingRecentReservations={false}
        isSyncingNewPendingReservation={false}
        isCancelingReservation={false}
        onCancelReservation={jest.fn().mockResolvedValue(undefined)}
      />,
    );
  });

  return tree!;
}

describe("HomeScreenLoggedIn", () => {
  const { useDriverReservationBids } = jest.requireMock(
    "./useDriverReservationBids",
  ) as MockDriverReservationBidsModule;

  beforeEach(() => {
    useDriverReservationBids.mockReset();
    useDriverReservationBids.mockReturnValue({
      driverBidsByReservationId: {},
      isLoadingDriverBids: false,
      submittingBidReservationId: null,
      submitBidForReservation: jest.fn(),
    });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders driver pending and assigned ride sections", () => {
    const reservations = [
      buildReservation({ status: "pending", driverId: null }),
      buildReservation({ id: "reservation-2", status: "accepted", driverId: "driver-1" }),
    ];
    const tree = renderHomeScreen({
      recentReservations: reservations,
      user: buildUser("driver-1", "driver"),
    });

    expect(hasText(tree, "Pending Reservation Rides")).toBe(true);
    expect(hasText(tree, "Your rides")).toBe(true);
    expect(hasText(tree, "Cancel ride")).toBe(true);
  });

  it("shows canceling state only for the matching driver ride", () => {
    const reservations = [
      buildReservation({ id: "reservation-1", status: "accepted", driverId: "driver-1" }),
      buildReservation({ id: "reservation-2", status: "accepted", driverId: "driver-1" }),
    ];
    const tree = renderHomeScreen({
      cancelingReservationId: "reservation-1",
      recentReservations: reservations,
      user: buildUser("driver-1", "driver"),
    });

    act(() => {
      tree.update(
        <HomeScreenLoggedIn
          user={buildUser("driver-1", "driver")}
          onSignOut={jest.fn()}
          onNavigate={jest.fn()}
          onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
          recentReservations={reservations}
          cancelingReservationId="reservation-1"
          isLoadingRecentReservations={false}
          isSyncingNewPendingReservation={false}
          isCancelingReservation
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    const textNodes = tree.root.findAll((node) => node.type === "Text");
    const renderedTexts = textNodes.flatMap((node) =>
      Array.isArray(node.props.children) ? node.props.children : [node.props.children],
    );

    expect(renderedTexts.filter((value) => value === "Canceling...")).toHaveLength(1);
    expect(renderedTexts.filter((value) => value === "Cancel ride")).toHaveLength(1);
  });

  it("renders rider timeline and recent trips", () => {
    const reservations = [
      buildReservation({
        status: "pending",
        activeBidCount: 2,
        lowestActiveBidAmountCents: 1850,
      }),
      buildReservation({ id: "reservation-2", status: "completed" }),
    ];

    const tree = renderHomeScreen({
      recentReservations: reservations,
      user: buildUser("rider-1", "rider"),
    });

    expect(hasText(tree, "Ride Status")).toBe(true);
    expect(hasText(tree, "2 offers received")).toBe(true);
    expect(hasText(tree, "Active bids")).toBe(true);
    expect(hasText(tree, "Review 2 offers")).toBe(true);
    expect(hasText(tree, "Best offer")).toBe(true);
    expect(hasText(tree, "$18.50")).toBe(true);
    expect(hasText(tree, "Recent Trips")).toBe(true);
  });

  it("alerts riders when a new bid arrives for the active reservation", () => {
    const tree = renderHomeScreen({
      recentReservations: [buildReservation({ status: "pending", activeBidCount: 0 })],
      user: buildUser("rider-1", "rider"),
    });

    act(() => {
      tree.update(
        <HomeScreenLoggedIn
          user={buildUser("rider-1", "rider")}
          onSignOut={jest.fn()}
          onNavigate={jest.fn()}
          onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
          recentReservations={[buildReservation({ status: "pending", activeBidCount: 1 })]}
          cancelingReservationId={null}
          isLoadingRecentReservations={false}
          isSyncingNewPendingReservation={false}
          isCancelingReservation={false}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "New driver bid",
      "A driver just placed a bid for your ride.",
      expect.arrayContaining([expect.objectContaining({ text: "Review offers" })]),
    );
  });

  it("alerts riders when their driver accepts the ride", () => {
    const tree = renderHomeScreen({
      recentReservations: [buildReservation({ status: "bid_selected", activeBidCount: 0 })],
      user: buildUser("rider-1", "rider"),
    });

    act(() => {
      tree.update(
        <HomeScreenLoggedIn
          user={buildUser("rider-1", "rider")}
          onSignOut={jest.fn()}
          onNavigate={jest.fn()}
          onRefreshReservations={jest.fn().mockResolvedValue(undefined)}
          recentReservations={[buildReservation({ status: "accepted", activeBidCount: 0 })]}
          cancelingReservationId={null}
          isLoadingRecentReservations={false}
          isSyncingNewPendingReservation={false}
          isCancelingReservation={false}
          onCancelReservation={jest.fn().mockResolvedValue(undefined)}
        />,
      );
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Ride accepted",
      "Your driver accepted the ride.",
      expect.arrayContaining([expect.objectContaining({ text: "View ride" })]),
    );
  });

  it("keeps the rider timeline visible for in-progress trips", () => {
    const reservations = [buildReservation({ status: "driver_en_route" })];
    const tree = renderHomeScreen({
      recentReservations: reservations,
      user: buildUser("rider-1", "rider"),
    });

    expect(hasText(tree, "Ride Status")).toBe(true);
  });
});
