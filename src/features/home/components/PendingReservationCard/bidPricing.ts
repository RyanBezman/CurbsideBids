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

export function formatBidAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function clampBidAmount(amountCents: number): number {
  return Math.max(MIN_BID_CENTS, amountCents);
}

export function getSuggestedBidAmountCents(
  estimatedTripMiles: number | null,
  estimatedTripMinutes: number | null,
): number {
  if (estimatedTripMiles === null && estimatedTripMinutes === null) return 2200;

  const mileageCents = estimatedTripMiles === null ? 0 : Math.round(estimatedTripMiles * 100);
  const timeCents = estimatedTripMinutes === null ? 0 : estimatedTripMinutes * 50;
  const roundedToDollar = Math.round((mileageCents + timeCents) / 100) * 100;

  return clampBidAmount(roundedToDollar);
}

export function buildBidWheelOptions(centerAmountCents: number): number[] {
  const start = clampBidAmount(centerAmountCents - WHEEL_RANGE_STEPS * WHEEL_STEP_CENTS);
  const out: number[] = [];

  for (let index = 0; index <= WHEEL_RANGE_STEPS * 2; index += 1) {
    out.push(start + index * WHEEL_STEP_CENTS);
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
