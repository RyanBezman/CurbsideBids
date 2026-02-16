import { formatPhoneForDisplay, normalizePhoneInput } from "./phone";

describe("phone formatting", () => {
  it("normalizes arbitrary phone input", () => {
    expect(normalizePhoneInput("(516) 406-4098")).toBe("5164064098");
    expect(normalizePhoneInput("abc123-45")).toBe("12345");
  });

  it("formats 10-digit US numbers for display", () => {
    expect(formatPhoneForDisplay("5164064098")).toBe("(516) 406-4098");
    expect(formatPhoneForDisplay("5164")).toBe("(516) 4");
  });
});
