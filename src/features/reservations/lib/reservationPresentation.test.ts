import { formatStatusLabel, shortId } from "./reservationPresentation";

describe("reservation presentation", () => {
  it("formats status labels", () => {
    expect(formatStatusLabel("pending")).toBe("Pending");
    expect(formatStatusLabel("bid_selected")).toBe("Bid Selected");
    expect(formatStatusLabel("accepted")).toBe("Accepted");
    expect(formatStatusLabel("driver_en_route")).toBe("In progress");
  });

  it("shortens long ids", () => {
    expect(shortId("12345678")).toBe("12345678");
    expect(shortId("1234567890")).toBe("12345678...");
  });
});
