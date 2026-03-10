import {
  formatScheduleForConfirmation,
  getWallClockDateInTimeZone,
  serializeWallClockDateForTimeZone,
} from "./dateTime";

describe("dateTime helpers", () => {
  it("serializes a picked wall-clock time into the pickup timezone", () => {
    const localSelection = new Date(2026, 0, 15, 15, 30, 0, 0);

    expect(
      serializeWallClockDateForTimeZone(localSelection, "America/Los_Angeles"),
    ).toBe("2026-01-15T23:30:00.000Z");
  });

  it("formats confirmation time in the provided timezone", () => {
    expect(
      formatScheduleForConfirmation(
        "2026-01-15T23:30:00.000Z",
        "America/Los_Angeles",
      ),
    ).toContain("3:30:00 PM");
  });

  it("converts an instant into pickup-local wall clock parts", () => {
    const instant = new Date("2026-01-15T23:30:00.000Z");

    const wallClock = getWallClockDateInTimeZone(instant, "America/Los_Angeles");

    expect(wallClock.getFullYear()).toBe(2026);
    expect(wallClock.getMonth()).toBe(0);
    expect(wallClock.getDate()).toBe(15);
    expect(wallClock.getHours()).toBe(15);
    expect(wallClock.getMinutes()).toBe(30);
  });

  it("keeps the same wall-clock time when the pickup timezone changes", () => {
    const selectedWallClock = new Date(2026, 0, 15, 15, 30, 0, 0);
    const losAngelesIso = serializeWallClockDateForTimeZone(
      selectedWallClock,
      "America/Los_Angeles",
    );
    const newYorkIso = serializeWallClockDateForTimeZone(
      selectedWallClock,
      "America/New_York",
    );

    expect(losAngelesIso).toBe("2026-01-15T23:30:00.000Z");
    expect(newYorkIso).toBe("2026-01-15T20:30:00.000Z");
    expect(
      formatScheduleForConfirmation(losAngelesIso, "America/Los_Angeles"),
    ).toContain("3:30:00 PM");
    expect(
      formatScheduleForConfirmation(newYorkIso, "America/New_York"),
    ).toContain("3:30:00 PM");
  });

  it("handles daylight saving transitions deterministically", () => {
    expect(
      serializeWallClockDateForTimeZone(
        new Date(2026, 2, 8, 3, 30, 0, 0),
        "America/New_York",
      ),
    ).toBe("2026-03-08T07:30:00.000Z");
    expect(
      serializeWallClockDateForTimeZone(
        new Date(2026, 10, 1, 1, 30, 0, 0),
        "America/New_York",
      ),
    ).toBe("2026-11-01T05:30:00.000Z");
  });
});
