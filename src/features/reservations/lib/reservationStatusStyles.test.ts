import { getStatusClasses } from "./reservationStatusStyles";

describe("reservation status styles", () => {
  it("returns amber styles for pending status", () => {
    const classes = getStatusClasses("pending");
    expect(classes.chip).toContain("amber");
    expect(classes.text).toContain("amber");
  });

  it("returns fallback neutral styles", () => {
    const classes = getStatusClasses("driver_en_route");
    expect(classes.chip).toContain("neutral");
    expect(classes.text).toContain("neutral");
  });
});
