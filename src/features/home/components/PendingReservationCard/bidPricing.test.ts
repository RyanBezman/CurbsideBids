import {
  buildBidWheelOptions,
  clampBidAmount,
  getFareGuidanceCents,
  getClosestWheelIndex,
  getSuggestedBidAmountCents,
  MIN_BID_CENTS,
} from "./bidPricing";

describe("bidPricing", () => {
  it("calculates suggested bid from miles and minutes", () => {
    expect(getSuggestedBidAmountCents(10, 20)).toBe(2000);
  });

  it("clamps bids to minimum amount", () => {
    expect(clampBidAmount(100)).toBe(MIN_BID_CENTS);
  });

  it("builds wheel options around center and finds nearest index", () => {
    const options = buildBidWheelOptions(2200);
    expect(options.length).toBeGreaterThan(20);

    const nearestIndex = getClosestWheelIndex(options, 2250);
    expect(options[nearestIndex]).toBe(2200);
  });

  it("caps wheel options and selected amount at the rider max budget", () => {
    const options = buildBidWheelOptions(2200, 1800);

    expect(clampBidAmount(2200, 1800)).toBe(1800);
    expect(options[options.length - 1]).toBe(1800);
  });

  it("builds rider fare guidance from the shared pricing model", () => {
    const guidance = getFareGuidanceCents(10, 20);

    expect(guidance.rangeMinCents).toBeLessThan(guidance.defaultMaxFareCents);
    expect(guidance.defaultMaxFareCents).toBeGreaterThanOrEqual(guidance.baselineCents);
    expect(guidance.rangeMaxCents).toBeGreaterThan(guidance.rangeMinCents);
  });
});
