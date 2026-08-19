// ── Known localities lookup (all-India) ──────────────────────────────────────
// Finds the nearest known place name to a given lat/long, so the homepage
// location label shows an accurate town/city name instead of trusting
// OpenStreetMap's reverse-geocoder alone — which sometimes collapses a real,
// separately-governed town into the nearest bigger city it has tagged (e.g.
// Risali, its own Municipal Corporation since 2020, came back simply as
// "Durg" from OSM because that's the nearest place its underlying map data
// had labelled there).
//
// Data source: india-cities.json — extracted from the GeoNames Gazetteer
// (CC BY 4.0, https://www.geonames.org), covering ~7,059 Indian cities/towns
// with population > 1000 or administrative-seat status. This is NOT a
// hand-typed list — it's real open geographic data covering the whole
// country, so this works for any state/city, not just Chhattisgarh.
//
// MANUAL_OVERRIDES below is for the (rare) very-new or very-small places that
// predate/postdate this dataset's snapshot and aren't in it yet — e.g.
// Risali. Add an entry there if a specific place is ever missing; no other
// code needs to change.
import indiaCities from "./india-cities.json";

const MANUAL_OVERRIDES = [
  { name: "Risali", lat: 21.2012, lng: 81.3347 },
];

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

// Combined list, built once at module load (not on every call).
const ALL_PLACES = [
  ...MANUAL_OVERRIDES,
  ...indiaCities.map((c) => ({ name: c.n, lat: c.lat, lng: c.lng })),
];

// Returns { name, distanceKm } for the closest known place to the given
// coordinates, out of ~7,000+ Indian cities/towns. Caller decides how far is
// "too far to trust" (TopHeader currently uses 8km before falling back to
// OpenStreetMap's own reverse-geocode result).
export function nearestKnownLocality(lat, lng) {
  let closest = null;
  for (const place of ALL_PLACES) {
    // Cheap pre-filter: skip the expensive trig for anything way outside a
    // ~1.5 degree box (~150km) before computing exact distance — this list
    // is large enough (7000+) that it's worth avoiding the full haversine
    // call for obviously-far places.
    if (Math.abs(place.lat - lat) > 1.5 || Math.abs(place.lng - lng) > 1.5) continue;

    const distanceKm = haversineDistanceKm(lat, lng, place.lat, place.lng);
    if (!closest || distanceKm < closest.distanceKm) {
      closest = { name: place.name, distanceKm };
    }
  }
  return closest;
}