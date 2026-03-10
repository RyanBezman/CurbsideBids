export type FareGuidance = {
  baselineCents: number;
  defaultMaxFareCents: number;
  rangeMaxCents: number;
  rangeMinCents: number;
};

export type BidPricingBreakdown = {
  mileageComponentCents: number;
  timeComponentCents: number;
  estimatedTripMiles: number | null;
  estimatedTripMinutes: number | null;
  tripBreakdownLabel: string;
};

export const MIN_BID_CENTS = 500;
export const WHEEL_STEP_CENTS = 100;
export const WHEEL_RANGE_STEPS = 24;
const MAX_FARE_PADDING_CENTS = 200;

export function formatBidAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function roundToDollar(amountCents: number): number {
  return Math.round(amountCents / 100) * 100;
}

export function clampBidAmount(amountCents: number, maxFareCents?: number): number {
  const minimumClamped = Math.max(MIN_BID_CENTS, amountCents);
  if (maxFareCents === undefined || maxFareCents === null) {
    return minimumClamped;
  }

  return Math.min(minimumClamped, Math.max(MIN_BID_CENTS, maxFareCents));
}

export function getSuggestedBidAmountCents(
  estimatedTripMiles: number | null,
  estimatedTripMinutes: number | null,
): number {
  if (estimatedTripMiles === null && estimatedTripMinutes === null) return 2200;

  const mileageCents = estimatedTripMiles === null ? 0 : Math.round(estimatedTripMiles * 100);
  const timeCents = estimatedTripMinutes === null ? 0 : estimatedTripMinutes * 50;
  const roundedToDollar = roundToDollar(mileageCents + timeCents);

  return clampBidAmount(roundedToDollar);
}

export function getFareGuidanceCents(
  estimatedTripMiles: number | null,
  estimatedTripMinutes: number | null,
): FareGuidance {
  const baselineCents = getSuggestedBidAmountCents(
    estimatedTripMiles,
    estimatedTripMinutes,
  );
  const rangeMinCents = clampBidAmount(roundToDollar(baselineCents * 0.9));
  const rangeMaxCents = clampBidAmount(roundToDollar(baselineCents * 1.15));
  const defaultMaxFareCents = clampBidAmount(
    Math.max(baselineCents + MAX_FARE_PADDING_CENTS, roundToDollar(baselineCents * 1.1)),
  );

  return {
    baselineCents,
    defaultMaxFareCents,
    rangeMaxCents,
    rangeMinCents,
  };
}

export function buildBidWheelOptions(centerAmountCents: number, maxFareCents?: number): number[] {
  const clampedCenter = clampBidAmount(centerAmountCents, maxFareCents);
  const start = clampBidAmount(
    clampedCenter - WHEEL_RANGE_STEPS * WHEEL_STEP_CENTS,
    maxFareCents,
  );
  const cap = maxFareCents === undefined ? Number.POSITIVE_INFINITY : maxFareCents;
  const out: number[] = [];

  for (let index = 0; index <= WHEEL_RANGE_STEPS * 2; index += 1) {
    const value = start + index * WHEEL_STEP_CENTS;
    if (value > cap) break;
    out.push(value);
  }

  if (out.length === 0) {
    return [clampBidAmount(clampedCenter, maxFareCents)];
  }

  return out;
}

export function getClosestWheelIndex(options: number[], amountCents: number): number {
  if (options.length === 0) return 0;

  let closestIndex = 0;
  let closestDelta = Number.POSITIVE_INFINITY;

  for (let index = 0; index < options.length; index += 1) {
    const delta = Math.abs(options[index] - amountCents);
    if (delta < closestDelta) {
      closestDelta = delta;
      closestIndex = index;
    }
  }

  return closestIndex;
}

export function getBidPricingBreakdown(
  estimatedTripMiles: number | null,
  estimatedTripMinutes: number | null,
): BidPricingBreakdown {
  const mileageComponentCents = estimatedTripMiles === null ? 0 : Math.round(estimatedTripMiles * 100);
  const timeComponentCents = estimatedTripMinutes === null ? 0 : estimatedTripMinutes * 50;

  const parts: string[] = [];
  if (estimatedTripMiles !== null) {
    parts.push(`~${estimatedTripMiles.toFixed(1)} mi`);
  }
  if (estimatedTripMinutes !== null) {
    parts.push(`~${estimatedTripMinutes} min`);
  }

  return {
    mileageComponentCents,
    timeComponentCents,
    estimatedTripMiles,
    estimatedTripMinutes,
    tripBreakdownLabel: parts.length === 0 ? "trip metrics unavailable" : parts.join(" • "),
  };
}
