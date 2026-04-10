import { createElement } from "react";
import { act, create } from "react-test-renderer";
import type { User } from "@supabase/supabase-js";
import type { ReservationRecord } from "@domain/reservations";
import { useRecentReservations } from "./useRecentReservations";

const mockChannel = jest.fn();
const mockRemoveChannel = jest.fn();
const mockSubscribe = jest.fn();

const bidChannelCallbacks = new Map<string, () => void>();
const reservationChannelCallbacks = new Map<
  string,
  (payload: { new?: unknown; old?: unknown }) => void
>();

jest.mock("@shared/api", () => ({
  supabase: {
    channel: (...args: unknown[]) => mockChannel(...args),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}));

jest.mock("../api", () => ({
  cancelReservation: jest.fn(),
  listDriverHomeReservations: jest.fn(),
  listPendingRideReservations: jest.fn(),
  listRecentReservations: jest.fn(),
}));

type MockReservationsApiModule = {
  listDriverHomeReservations: jest.Mock;
  listRecentReservations: jest.Mock;
};

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

describe("useRecentReservations", () => {
  const { listDriverHomeReservations, listRecentReservations } = jest.requireMock(
    "../api",
  ) as MockReservationsApiModule;
  const renderedHooks: ReturnType<typeof create>[] = [];

  beforeEach(() => {
    bidChannelCallbacks.clear();
    reservationChannelCallbacks.clear();
    mockSubscribe.mockReset().mockReturnValue({ unsubscribe: jest.fn() });
    mockRemoveChannel.mockReset().mockResolvedValue(undefined);
    mockChannel.mockReset().mockImplementation((name: string) => {
      const channel = {
        on: jest.fn(
          (
            _event: string,
            filter: { table?: string },
            callback: (payload: { new?: unknown; old?: unknown }) => void,
          ) => {
            if (filter.table === "reservations") {
              reservationChannelCallbacks.set(name, callback);
            }
            if (filter.table === "reservation_bids") {
              bidChannelCallbacks.set(name, () => callback({}));
            }
            return channel;
          },
        ),
        subscribe: mockSubscribe,
      };

      return channel;
    });
    listRecentReservations.mockReset().mockResolvedValue([
      buildReservation({ activeBidCount: 1, lowestActiveBidAmountCents: 1850 }),
    ]);
    listDriverHomeReservations.mockReset().mockResolvedValue([buildReservation()]);
  });

  afterEach(() => {
    while (renderedHooks.length > 0) {
      const renderedHook = renderedHooks.pop();
      if (!renderedHook) continue;

      act(() => {
        renderedHook.unmount();
      });
    }
  });

  it("refreshes rider reservations when a visible reservation bid changes", async () => {
    let hookState: ReturnType<typeof useRecentReservations> | null = null;

    function HookHarness() {
      hookState = useRecentReservations(buildUser("rider-1", "rider"));
      return null;
    }

    act(() => {
      renderedHooks.push(create(createElement(HookHarness)));
    });

    expect(mockChannel).toHaveBeenCalledWith("reservations-feed-rider-1");
    expect(mockChannel).toHaveBeenCalledWith("reservation-bids-feed-rider-1");

    await act(async () => {
      bidChannelCallbacks.get("reservation-bids-feed-rider-1")?.();
      await Promise.resolve();
    });
    await flushMicrotasks();

    expect(listRecentReservations).toHaveBeenCalledWith("rider-1", 10);
    expect(hookState?.recentReservations).toEqual([
      expect.objectContaining({ activeBidCount: 1, lowestActiveBidAmountCents: 1850 }),
    ]);
  });

  it("loads the combined driver home reservations feed for drivers", async () => {
    let hookState: ReturnType<typeof useRecentReservations> | null = null;

    function HookHarness() {
      hookState = useRecentReservations(buildUser("driver-1", "driver"));
      return null;
    }

    act(() => {
      renderedHooks.push(create(createElement(HookHarness)));
    });

    await act(async () => {
      await hookState?.loadRecentReservations("driver-1");
    });
    await flushMicrotasks();

    expect(listDriverHomeReservations).toHaveBeenCalledWith("driver-1", 100);
  });

  it("refreshes driver reservations when an assigned ride changes after selection", async () => {
    let hookState: ReturnType<typeof useRecentReservations> | null = null;

    function HookHarness() {
      hookState = useRecentReservations(buildUser("driver-1", "driver"));
      return null;
    }

    act(() => {
      renderedHooks.push(create(createElement(HookHarness)));
    });

    await act(async () => {
      await hookState?.loadRecentReservations("driver-1");
    });
    await flushMicrotasks();

    listDriverHomeReservations.mockClear();

    await act(async () => {
      reservationChannelCallbacks.get("reservations-feed-driver-1")?.({
        old: {
          id: "reservation-1",
          driver_id: "driver-1",
          kind: "scheduled",
          status: "accepted",
        },
        new: {
          id: "reservation-1",
          driver_id: "driver-1",
          kind: "scheduled",
          status: "driver_en_route",
        },
      });
      await Promise.resolve();
    });
    await flushMicrotasks();

    expect(listDriverHomeReservations).toHaveBeenCalledWith("driver-1", 100);
  });
});
