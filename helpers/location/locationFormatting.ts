import * as Location from "expo-location";

export function formatPickupFromLocation(
  coords: Location.LocationObjectCoords,
  place?: Location.LocationGeocodedAddress,
): string {
  if (place) {
    const street = [place.streetNumber, place.street]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim();
    const area = [place.city ?? place.subregion, place.region]
      .filter((part): part is string => Boolean(part))
      .join(", ");
    const namedPlace = place.name?.trim();

    if (street && area) return `${street}, ${area}`;
    if (street) return street;
    if (namedPlace && area) return `${namedPlace}, ${area}`;
    if (namedPlace) return namedPlace;
    if (area) return area;
  }

  return `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
}

export function formatPickupDisplayFromLocation(
  coords: Location.LocationObjectCoords,
  place?: Location.LocationGeocodedAddress,
): string {
  if (place) {
    const street = [place.streetNumber, place.street]
      .filter((part): part is string => Boolean(part))
      .join(" ")
      .trim();
    const namedPlace = place.name?.trim();

    if (street) return street;
    if (namedPlace) return namedPlace;
  }

  return formatPickupFromLocation(coords, place);
}
