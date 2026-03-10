import {
  canCancelReservationStatus,
  isActiveReservationStatus,
} from "./statuses";

describe("reservation status helpers", () => {
  it("treats en-route and picked up reservations as active", () => {
    expect(isActiveReservationStatus("driver_en_route")).toBe(true);
    expect(isActiveReservationStatus("picked_up")).toBe(true);
    expect(isActiveReservationStatus("completed")).toBe(false);
  });

  it("allows canceling bid-selected reservations", () => {
    expect(canCancelReservationStatus("bid_selected")).toBe(true);
    expect(canCancelReservationStatus("completed")).toBe(false);
  });
});
