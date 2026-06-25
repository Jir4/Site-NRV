import type { Location } from "../data/site";
import geocodedLocations from "../data/geocoded-locations.json";

export const getLocationCoordinates = (location: Location) => {
  const coordinates = geocodedLocations[location.id as keyof typeof geocodedLocations];

  if (!coordinates) {
    throw new Error(
      `Missing geocoded coordinates for location "${location.id}". Run npm run generate:maps.`,
    );
  }

  if (coordinates.address !== location.address) {
    throw new Error(
      `Outdated geocoded coordinates for location "${location.id}". Run npm run generate:maps.`,
    );
  }

  return coordinates;
};

export const getOsmUrl = (lat: number, lon: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

export const getLocationOsmUrl = (location: Location) => {
  const coordinates = getLocationCoordinates(location);
  return getOsmUrl(coordinates.lat, coordinates.lon);
};
