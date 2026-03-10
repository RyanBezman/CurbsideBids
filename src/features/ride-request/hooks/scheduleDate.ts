export function getInitialScheduleDate(now: Date = new Date()): Date {
  const value = new Date(now.getTime() + 60 * 60 * 1000);
  if (value.getSeconds() > 0 || value.getMilliseconds() > 0) {
    value.setMinutes(value.getMinutes() + 1);
  }
  value.setSeconds(0, 0);
  return value;
}
