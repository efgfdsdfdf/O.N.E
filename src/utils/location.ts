export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodedLocation | null> {
  const query = address.trim();
  if (!query) return null;

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Could not search for that location right now.');
  }

  const results: Array<{ lat: string; lon: string; display_name: string }> = await response.json();
  const first = results[0];
  if (!first) return null;

  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    displayName: first.display_name,
  };
}
