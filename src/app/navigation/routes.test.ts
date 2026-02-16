import { isRideRequestRoute, toAppRouteName } from "./routes";

describe("route compatibility", () => {
  it("maps legacy route names to app route names", () => {
    expect(toAppRouteName("signup")).toBe("signUp");
    expect(toAppRouteName("signin")).toBe("signIn");
    expect(toAppRouteName("whereto")).toBe("whereTo");
  });

  it("identifies ride request routes", () => {
    expect(isRideRequestRoute("whereTo")).toBe(true);
    expect(isRideRequestRoute("package")).toBe(true);
    expect(isRideRequestRoute("schedule")).toBe(true);
    expect(isRideRequestRoute("home")).toBe(false);
  });
});
