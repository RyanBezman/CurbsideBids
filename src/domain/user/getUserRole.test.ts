import { getUserRole } from "./getUserRole";

describe("getUserRole", () => {
  it("defaults to rider when role is missing", () => {
    expect(getUserRole(null)).toBe("rider");
    expect(getUserRole({ user_metadata: {} })).toBe("rider");
  });

  it("returns driver when metadata role is driver", () => {
    expect(getUserRole({ user_metadata: { role: "driver" } })).toBe("driver");
  });
});
