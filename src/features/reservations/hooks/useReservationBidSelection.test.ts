import { createElement } from "react";
import { act, create } from "react-test-renderer";
import type { ReservationBidRecord, ReservationRecord } from "@domain/reservations";
import { useReservationBidSelection } from "./useReservationBidSelection";

const mockSubscribe = jest.fn();
const mockOn = jest.fn();
const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();

jest.mock("@shared/api", () => ({
  supabase: {
    channel: (...args: unknown[]) => mockChannel(...args),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}));

function buildReservation(
  overrides: Partial<ReservationRecord> = {},
): ReservationRecord {
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

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useReservationBidSelection", () => {
  beforeEach(() => {
    mockSubscribe.mockReset().mockReturnValue({ unsubscribe: jest.fn() });
    mockOn.mockReset().mockReturnThis();
    mockChannel.mockReset().mockReturnValue({
      on: mockOn,
      subscribe: mockSubscribe,
    });
    mockRemoveChannel.mockReset().mockResolvedValue(undefined);
  });

  it("loads bids for a pending reservation and selects a bid", async () => {
    const reservation = buildReservation();
    const bids: ReservationBidRecord[] = [
      {
        id: "bid-1",
        reservationId: "reservation-1",
        driverId: "driver-1",
        amountCents: 2100,
        etaMinutes: 14,
        note: "On my way soon.",
        status: "active",
        createdAt: "2026-03-01T10:05:00.000Z",
        updatedAt: "2026-03-01T10:05:00.000Z",
      },
    ];
    const listReservationBidsFn = jest.fn().mockResolvedValue(bids);
    const selectReservationBidFn = jest
      .fn()
      .mockResolvedValue(buildReservation({ status: "bid_selected", selectedBidId: "bid-1" }));
    const onBidSelected = jest.fn().mockResolvedValue(undefined);
    let hookState: ReturnType<typeof useReservationBidSelection> | null = null;

    function HookHarness() {
      hookState = useReservationBidSelection({
        reservation,
        listReservationBidsFn,
        onBidSelected,
        selectReservationBidFn,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });
    await flushMicrotasks();

    expect(listReservationBidsFn).toHaveBeenCalledWith("reservation-1");
    expect(hookState?.bids).toEqual(bids);
    expect(mockChannel).toHaveBeenCalledWith("reservation-bids-reservation-1");

    await act(async () => {
      await hookState?.onSelectBid("bid-1");
    });

    expect(selectReservationBidFn).toHaveBeenCalledWith("reservation-1", "bid-1");
    expect(onBidSelected).toHaveBeenCalledWith(
      expect.objectContaining({ status: "bid_selected", selectedBidId: "bid-1" }),
    );
    expect(hookState?.isSelectingBidId).toBeNull();
  });

  it("does not load bids for a non-pending reservation", async () => {
    const reservation = buildReservation({ status: "bid_selected" });
    const listReservationBidsFn = jest.fn().mockResolvedValue([]);
    let hookState: ReturnType<typeof useReservationBidSelection> | null = null;

    function HookHarness() {
      hookState = useReservationBidSelection({
        reservation,
        listReservationBidsFn,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });
    await flushMicrotasks();

    expect(listReservationBidsFn).not.toHaveBeenCalled();
    expect(mockChannel).not.toHaveBeenCalled();
    expect(hookState?.bids).toEqual([]);
  });
});
