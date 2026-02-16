import type {
  AppRouteName,
  LegacyRouteName,
  NavigableRouteName,
} from "./types";

const LEGACY_TO_APP_ROUTE_NAME: Record<LegacyRouteName, AppRouteName> = {
  home: "home",
  signup: "signUp",
  signin: "signIn",
  whereto: "whereTo",
  package: "package",
  schedule: "schedule",
};

export function toAppRouteName(route: NavigableRouteName): AppRouteName {
  return (LEGACY_TO_APP_ROUTE_NAME[route as LegacyRouteName] ?? route) as AppRouteName;
}

export function isRideRequestRoute(route: AppRouteName): boolean {
  return route === "whereTo" || route === "package" || route === "schedule";
}
