export type AppRouteName =
  | "home"
  | "signUp"
  | "signIn"
  | "whereTo"
  | "package"
  | "schedule";

export type LegacyRouteName =
  | "home"
  | "signup"
  | "signin"
  | "whereto"
  | "package"
  | "schedule";

export type NavigableRouteName = AppRouteName | LegacyRouteName;

export type RootStackParamList = Record<AppRouteName, undefined>;
