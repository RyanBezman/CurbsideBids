import { createElement } from "react";
import { Alert } from "react-native";
import type { User } from "@supabase/supabase-js";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useScheduleSubmission } from "./useScheduleSubmission";

jest.mock("../../../shared/lib", () => {
  const actual = jest.requireActual("../../../shared/lib/dateTime") as {
    formatScheduleForConfirmation: (iso: string, timeZone?: string) => string;
    serializeWallClockDateForTimeZone: (date: Date, timeZone?: string) => string;
  };
  return {
    formatScheduleForConfirmation: actual.formatScheduleForConfirmation,
    serializeWallClockDateForTimeZone: actual.serializeWallClockDateForTimeZone,
  };
});

jest.mock("../../reservations", () => ({
  createScheduledReservation: jest.fn(),
}));

type MockReservationsModule = {
  createScheduledReservation: jest.Mock<Promise<{ id: string }>, [unknown, string]>;
};

type HookHarnessProps = {
  user: User | null;
};

const buildLocation = (timeZone?: string) => ({
  label: "LAX",
  latitude: 33.9416,
  longitude: -118.4085,
  provider: "nominatim" as const,
  timeZone,
});

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useScheduleSubmission", () => {
  const { createScheduledReservation } = jest.requireMock(
    "../../reservations",
  ) as MockReservationsModule;

  beforeEach(() => {
    createScheduledReservation.mockReset();
    createScheduledReservation.mockResolvedValue({ id: "reservation-1" });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    jest.spyOn(Date, "now").mockReturnValue(
      new Date("2026-01-15T18:00:00.000Z").getTime(),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("serializes the scheduled wall-clock time using the pickup timezone", async () => {
    const loadRecentReservations = jest.fn().mockResolvedValue(undefined);
    const onNavigate = jest.fn();
    let hookState: ReturnType<typeof useScheduleSubmission> | null = null;

    function HookHarness({ user }: HookHarnessProps) {
      hookState = useScheduleSubmission({
        dropoff: "Downtown",
        dropoffLocation: buildLocation(),
        loadRecentReservations,
        onNavigate,
        maxFareCents: 2500,
        pickup: "Airport",
        pickupLocation: buildLocation("America/Los_Angeles"),
        rideType: "Economy",
        scheduleDate: new Date(2026, 0, 15, 15, 30, 0, 0),
        setDropoff: jest.fn(),
        setDropoffLocation: jest.fn(),
        setRideType: jest.fn(),
        user,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness, { user: { id: "user-1" } as unknown as User }));
    });

    await act(async () => {
      hookState?.handleScheduleFindRides();
    });

    expect(createScheduledReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        pickup: "Airport",
        dropoff: "Downtown",
        pickupLocation: expect.objectContaining({
          timeZone: "America/Los_Angeles",
        }),
        maxFareCents: 2500,
        scheduledAtIso: "2026-01-15T23:30:00.000Z",
      }),
      "user-1",
    );
    expect(loadRecentReservations).toHaveBeenCalledWith("user-1");
  });

  it("rejects schedules that are less than one hour away in the pickup timezone", async () => {
    jest.spyOn(Date, "now").mockReturnValue(
      new Date("2026-01-15T18:45:00.000Z").getTime(),
    );
    const loadRecentReservations = jest.fn().mockResolvedValue(undefined);
    let hookState: ReturnType<typeof useScheduleSubmission> | null = null;

    function HookHarness() {
      hookState = useScheduleSubmission({
        dropoff: "Downtown",
        dropoffLocation: buildLocation(),
        loadRecentReservations,
        maxFareCents: 2500,
        onNavigate: jest.fn(),
        pickup: "Airport",
        pickupLocation: buildLocation("America/Los_Angeles"),
        rideType: "Economy",
        scheduleDate: new Date(2026, 0, 15, 11, 15, 0, 0),
        setDropoff: jest.fn(),
        setDropoffLocation: jest.fn(),
        setRideType: jest.fn(),
        user: { id: "user-1" } as unknown as User,
      });
      return null;
    }

    act(() => {
      create(createElement(HookHarness));
    });

    await act(async () => {
      hookState?.handleScheduleFindRides();
    });

    expect(createScheduledReservation).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Invalid schedule time",
      "Scheduled rides must be at least 1 hour from now at the pickup location.",
    );
  });

  it("submits a pending scheduled ride after the rider signs in", async () => {
    const loadRecentReservations = jest.fn().mockResolvedValue(undefined);
    const onNavigate = jest.fn();
    let hookState: ReturnType<typeof useScheduleSubmission> | null = null;
    let renderer: ReactTestRenderer;

    function HookHarness({ user }: HookHarnessProps) {
      hookState = useScheduleSubmission({
        dropoff: "Downtown",
        dropoffLocation: buildLocation(),
        loadRecentReservations,
        maxFareCents: 2500,
        onNavigate,
        pickup: "Airport",
        pickupLocation: buildLocation("America/Los_Angeles"),
        rideType: "Economy",
        scheduleDate: new Date(2026, 0, 15, 15, 30, 0, 0),
        setDropoff: jest.fn(),
        setDropoffLocation: jest.fn(),
        setRideType: jest.fn(),
        user,
      });
      return null;
    }

    act(() => {
      renderer = create(createElement(HookHarness, { user: null }));
    });

    await act(async () => {
      hookState?.handleScheduleFindRides();
    });

    expect(createScheduledReservation).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Sign in required",
      "Sign in to schedule your ride. We'll submit it right after you sign in.",
      expect.any(Array),
    );

    act(() => {
      renderer.update(
        createElement(HookHarness, { user: { id: "user-1" } as unknown as User }),
      );
    });
    await flushMicrotasks();

    expect(createScheduledReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        maxFareCents: 2500,
        scheduledAtIso: "2026-01-15T23:30:00.000Z",
      }),
      "user-1",
    );
  });
});
