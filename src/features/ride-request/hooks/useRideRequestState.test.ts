import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { getInitialScheduleDate } from "./scheduleDate";
import { useRideRequestState } from "./useRideRequestState";

jest.mock("expo-location", () => ({
  Accuracy: {
    Balanced: "balanced",
  },
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

jest.mock("../../../shared/lib/location", () => ({
  ensureForegroundLocationPermission: jest.fn(),
  formatPickupDisplayFromLocation: jest.fn(),
  formatPickupFromLocation: jest.fn(),
  resolveTimeZoneForCoords: jest.fn(),
}));

type MockLocationModule = {
  resolveTimeZoneForCoords: jest.Mock<Promise<string | null>, [number, number]>;
};

const buildSuggestion = (label: string, latitude: number, longitude: number) => ({
  id: `${latitude}-${longitude}`,
  title: label,
  label,
  location: { latitude, longitude },
});

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("getInitialScheduleDate", () => {
  it("defaults to at least one hour in the future", () => {
    const now = new Date("2026-03-10T12:45:30.000Z");

    const initial = getInitialScheduleDate(now);

    expect(initial.getTime() - now.getTime()).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(initial.getUTCSeconds()).toBe(0);
    expect(initial.getUTCMilliseconds()).toBe(0);
  });
});

describe("useRideRequestState", () => {
  const { resolveTimeZoneForCoords } = jest.requireMock(
    "../../../shared/lib/location",
  ) as MockLocationModule;

  beforeEach(() => {
    resolveTimeZoneForCoords.mockReset();
  });

  it("preserves the selected schedule date while pickup timezone resolves", async () => {
    resolveTimeZoneForCoords.mockResolvedValue("America/Los_Angeles");

    let hookState: ReturnType<typeof useRideRequestState> | null = null;

    function HookHarness() {
      hookState = useRideRequestState();
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    const selectedDate = new Date(2026, 0, 15, 15, 30, 0, 0);

    act(() => {
      hookState?.setScheduleDate(selectedDate);
    });

    act(() => {
      hookState?.handlePickupSelectSuggestion(
        buildSuggestion("Los Angeles", 34.0522, -118.2437),
      );
    });

    expect(hookState?.scheduleDate.getTime()).toBe(selectedDate.getTime());
    expect(hookState?.pickupLocation?.timeZone).toBeUndefined();
    expect(hookState?.maxFareCents).toBeGreaterThan(0);

    await flushMicrotasks();

    expect(hookState?.scheduleDate.getTime()).toBe(selectedDate.getTime());
    expect(hookState?.pickupLocation?.timeZone).toBe("America/Los_Angeles");
  });

  it("keeps the same wall-clock selection when pickup changes to a different timezone", async () => {
    resolveTimeZoneForCoords
      .mockResolvedValueOnce("America/Los_Angeles")
      .mockResolvedValueOnce("America/New_York");

    let hookState: ReturnType<typeof useRideRequestState> | null = null;

    function HookHarness() {
      hookState = useRideRequestState();
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    const selectedDate = new Date(2026, 0, 15, 15, 30, 0, 0);

    act(() => {
      hookState?.setScheduleDate(selectedDate);
      hookState?.handlePickupSelectSuggestion(
        buildSuggestion("Los Angeles", 34.0522, -118.2437),
      );
    });
    await flushMicrotasks();

    act(() => {
      hookState?.handlePickupSelectSuggestion(
        buildSuggestion("New York", 40.7128, -74.006),
      );
    });

    expect(hookState?.scheduleDate.getTime()).toBe(selectedDate.getTime());

    await flushMicrotasks();

    expect(hookState?.scheduleDate.getTime()).toBe(selectedDate.getTime());
    expect(hookState?.pickupLocation?.timeZone).toBe("America/New_York");
  });

  it("resets the rider max budget override when the route changes", () => {
    let hookState: ReturnType<typeof useRideRequestState> | null = null;

    function HookHarness() {
      hookState = useRideRequestState();
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    const defaultMaxFareCents = hookState?.maxFareCents ?? 0;

    act(() => {
      hookState?.setMaxFareCents(defaultMaxFareCents + 500);
    });

    expect(hookState?.maxFareCents).toBe(defaultMaxFareCents + 500);

    act(() => {
      hookState?.handleDropoffChange("New dropoff");
    });

    expect(hookState?.maxFareCents).toBe(defaultMaxFareCents);
  });
});
