import {
  buildBidWheelOptions,
  clampBidAmount,
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
});
