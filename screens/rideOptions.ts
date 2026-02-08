import type { RideType } from "./types";

type RideOption = {
  type: RideType;
  source: number;
  minsAway: string;
  arrival: string;
};

export const RIDE_OPTIONS = [
  {
    type: "Economy",
    source: require("../graphics/economy-graphic.png"),
    minsAway: "3 min away",
    arrival: "Arrives ~2:24 PM",
  },
  {
    type: "XL",
    source: require("../graphics/xl-graphic.png"),
    minsAway: "5 min away",
    arrival: "Arrives ~2:26 PM",
  },
  {
    type: "Luxury",
    source: require("../graphics/lux-sedan-graphic.png"),
    minsAway: "7 min away",
    arrival: "Arrives ~2:28 PM",
  },
  {
    type: "Luxury SUV",
    source: require("../graphics/lux-suv-graphic.png"),
    minsAway: "4 min away",
    arrival: "Arrives ~2:25 PM",
  },
] as const satisfies readonly RideOption[];

export const RIDE_ASSET_MODULES = RIDE_OPTIONS.map(({ source }) => source);
