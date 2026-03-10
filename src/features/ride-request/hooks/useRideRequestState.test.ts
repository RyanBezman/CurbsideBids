import { getInitialScheduleDate } from "./scheduleDate";

describe("getInitialScheduleDate", () => {
  it("defaults to at least one hour in the future", () => {
    const now = new Date("2026-03-10T12:45:30.000Z");

    const initial = getInitialScheduleDate(now);

    expect(initial.getTime() - now.getTime()).toBeGreaterThanOrEqual(60 * 60 * 1000);
    expect(initial.getUTCSeconds()).toBe(0);
    expect(initial.getUTCMilliseconds()).toBe(0);
  });
});
