import { estimateTripDistanceMiles, estimateTripDurationMinutes } from "./tripEstimates";
import type { LocationPoint } from "./locationPoint";

function point(label: string, latitude: number, longitude: number): LocationPoint {
  return {
    label,
    latitude,
    longitude,
    provider: "nominatim",
  };
}

describe("estimateTripDurationMinutes", () => {
  it("returns null when either point is missing", () => {
    expect(estimateTripDurationMinutes(null, point("Dropoff", 40.7484, -73.9857))).toBeNull();
    expect(estimateTripDurationMinutes(point("Pickup", 40.7128, -74.006), null)).toBeNull();
  });

  it("returns a minimum duration for short rides", () => {
    const minutes = estimateTripDurationMinutes(
      point("A", 40.7128, -74.006),
      point("B", 40.713, -74.0059),
    );

    expect(minutes).toBe(5);
  });

  it("estimates longer rides higher than short rides", () => {
    const shortRide = estimateTripDurationMinutes(
      point("A", 40.758, -73.9855),
      point("B", 40.7614, -73.9776),
    );
    const longRide = estimateTripDurationMinutes(
      point("A", 40.758, -73.9855),
      point("B", 40.6501, -73.9496),
    );

    expect(shortRide).not.toBeNull();
    expect(longRide).not.toBeNull();
    expect(longRide).toBeGreaterThan(shortRide as number);
  });
});

describe("estimateTripDistanceMiles", () => {
  it("returns null when either point is missing", () => {
    expect(estimateTripDistanceMiles(null, point("Dropoff", 40.7484, -73.9857))).toBeNull();
    expect(estimateTripDistanceMiles(point("Pickup", 40.7128, -74.006), null)).toBeNull();
  });

  it("returns a positive estimate for a short trip", () => {
    const miles = estimateTripDistanceMiles(
      point("A", 40.758, -73.9855),
      point("B", 40.7614, -73.9776),
    );

    expect(miles).not.toBeNull();
    expect(miles as number).toBeGreaterThan(0);
  });

  it("estimates longer trips as more miles than short trips", () => {
    const shortTripMiles = estimateTripDistanceMiles(
      point("A", 40.758, -73.9855),
      point("B", 40.7614, -73.9776),
    );
    const longTripMiles = estimateTripDistanceMiles(
      point("A", 40.758, -73.9855),
      point("B", 40.6501, -73.9496),
    );

    expect(shortTripMiles).not.toBeNull();
    expect(longTripMiles).not.toBeNull();
    expect(longTripMiles).toBeGreaterThan(shortTripMiles as number);
  });
});
