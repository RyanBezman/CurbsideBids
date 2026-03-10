type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

function getLocalDateParts(date: Date): LocalDateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    millisecond: date.getMilliseconds(),
  };
}

function getDatePartsInTimeZone(date: Date, timeZone: string): LocalDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value ?? "0");
  };

  return {
    year: partValue("year"),
    month: partValue("month"),
    day: partValue("day"),
    hour: partValue("hour"),
    minute: partValue("minute"),
    second: partValue("second"),
    millisecond: date.getMilliseconds(),
  };
}

function getZonedWallClockMillis(date: Date, timeZone: string): number {
  const parts = getDatePartsInTimeZone(date, timeZone);
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

function formatInTimeZone(
  iso: string,
  timeZone: string | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(iso);
  if (!timeZone) {
    return date.toLocaleString(undefined, options);
  }

  return date.toLocaleString(undefined, {
    ...options,
    timeZone,
  });
}

export function serializeWallClockDateForTimeZone(
  date: Date,
  timeZone?: string,
): string {
  if (!timeZone) {
    return date.toISOString();
  }

  const parts = getLocalDateParts(date);
  const wallClockUtcMillis = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );

  let candidateMillis = wallClockUtcMillis;

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const offsetMillis =
      getZonedWallClockMillis(new Date(candidateMillis), timeZone) - candidateMillis;
    const nextCandidateMillis = wallClockUtcMillis - offsetMillis;

    if (nextCandidateMillis === candidateMillis) {
      break;
    }

    candidateMillis = nextCandidateMillis;
  }

  return new Date(candidateMillis).toISOString();
}

export function getWallClockDateInTimeZone(
  date: Date,
  timeZone?: string,
): Date {
  const parts = timeZone ? getDatePartsInTimeZone(date, timeZone) : getLocalDateParts(date);
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

export function formatScheduleForConfirmation(
  iso: string,
  timeZone?: string,
): string {
  return formatInTimeZone(iso, timeZone);
}
