import { createElement } from "react";
import { act, create } from "react-test-renderer";
import type { ReservationRecord } from "@domain/reservations";
import { useDriverReservationBids } from "./useDriverReservationBids";

function buildReservation(id: string): ReservationRecord {
  return {
    id,
    kind: "scheduled",
    status: "pending",
    driverId: null,
    selectedBidId: null,
    activeBidCount: 0,
    agreedFareCents: null,
    maxFareCents: 2400,
    rideType: "Economy",
    pickupLabel: "A",
    pickupLocation: null,
    dropoffLabel: "B",
    dropoffLocation: null,
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    canceledAt: null,
  };
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useDriverReservationBids loading", () => {
  it("loads bids and filters to current reservation ids", async () => {
    const reservationIds = ["res-1"];
    const listDriverReservationBidsFn = jest.fn().mockResolvedValue([
      {
        id: "bid-1",
        reservationId: "res-1",
        driverId: "driver-1",
        amountCents: 1500,
        etaMinutes: 20,
        note: null,
        status: "active",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
      {
        id: "bid-2",
        reservationId: "res-other",
        driverId: "driver-1",
        amountCents: 1800,
        etaMinutes: 25,
        note: null,
        status: "active",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ]);

    let hookState: ReturnType<typeof useDriverReservationBids> | null = null;

    function HookHarness() {
      hookState = useDriverReservationBids({
        isDriver: true,
        reservationIds,
        userId: "driver-1",
        listDriverReservationBidsFn,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });
    await flushMicrotasks();

    expect(hookState?.driverBidsByReservationId["res-1"]).toBeDefined();
    expect(hookState?.driverBidsByReservationId["res-other"]).toBeUndefined();
    expect(listDriverReservationBidsFn).toHaveBeenCalledWith("driver-1", 200);
  });
});

describe("useDriverReservationBids submission", () => {
  it("submits bid and clears submitting state", async () => {
    const reservation = buildReservation("res-99");
    const reservationIds = [reservation.id];
    const listDriverReservationBidsFn = jest.fn().mockResolvedValue([]);
    const upsertReservationBidFn = jest.fn().mockResolvedValue({
      id: "bid-99",
      reservationId: "res-99",
      driverId: "driver-1",
      amountCents: 2400,
      etaMinutes: 18,
      note: "Fast pickup",
      status: "active",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });

    let hookState: ReturnType<typeof useDriverReservationBids> | null = null;

    function HookHarness() {
      hookState = useDriverReservationBids({
        isDriver: true,
        reservationIds,
        userId: "driver-1",
        listDriverReservationBidsFn,
        upsertReservationBidFn,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });
    await flushMicrotasks();

    await act(async () => {
      await hookState?.submitBidForReservation({
        reservation,
        estimatedTripMinutes: 18,
        input: {
          amountCents: 2400,
          note: "Fast pickup",
        },
      });
    });

    expect(upsertReservationBidFn).toHaveBeenCalledWith(
      {
        reservationId: "res-99",
        amountCents: 2400,
        etaMinutes: 18,
        note: "Fast pickup",
      },
      "driver-1",
    );
    expect(hookState?.submittingBidReservationId).toBeNull();
    expect(hookState?.driverBidsByReservationId["res-99"]?.id).toBe("bid-99");
  });
});

describe("useDriverReservationBids rider max budget", () => {
  it("rejects driver bids above the rider max budget before submission", async () => {
    const reservation = buildReservation("res-100");
    const reservationIds = [reservation.id];
    const listDriverReservationBidsFn = jest.fn().mockResolvedValue([]);
    const upsertReservationBidFn = jest.fn();
    let hookState: ReturnType<typeof useDriverReservationBids> | null = null;

    function HookHarness() {
      hookState = useDriverReservationBids({
        isDriver: true,
        reservationIds,
        userId: "driver-1",
        listDriverReservationBidsFn,
        upsertReservationBidFn,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });
    await flushMicrotasks();

    let thrownError: unknown;
    await act(async () => {
      try {
        await hookState?.submitBidForReservation({
          reservation,
          estimatedTripMinutes: 18,
          input: {
            amountCents: 2500,
            note: null,
          },
        });
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toEqual(
      new Error("This rider only accepts bids up to $24.00."),
    );
    expect(upsertReservationBidFn).not.toHaveBeenCalled();
  });
});
