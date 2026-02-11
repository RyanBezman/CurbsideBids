import { Alert, Linking } from "react-native";
import * as Location from "expo-location";

export async function ensureForegroundLocationPermission(): Promise<boolean> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    Alert.alert(
      "Location Services Off",
      "Turn on Location Services in iOS Settings to use your current pickup.",
    );
    return false;
  }

  const currentPermission = await Location.getForegroundPermissionsAsync();
  if (currentPermission.granted) return true;

  if (currentPermission.canAskAgain) {
    const requestedPermission = await Location.requestForegroundPermissionsAsync();
    return requestedPermission.granted;
  }

  Alert.alert(
    "Location Permission Needed",
    "Enable Location access in Settings to auto-fill pickup with your current location.",
    [
      { text: "Not now", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ],
  );

  return false;
}
