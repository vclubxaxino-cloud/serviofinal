// ── Location / distance utilities (all-India) ──────────────────────────────
// Servio matches users to workers using Indian PIN codes. The OLD logic
// treated pincodes as plain numbers and compared their numeric difference
// — e.g. |491001 - 490001| — which has nothing to do with real-world
// distance. Durg (491001) and Bhilai (490001) are only ~10 km apart in
// reality, but that old check rejected them as "too far" because the
// numbers themselves differ by 1000.
//
// This resolves EVERY Indian pincode to real coordinates using two free,
// no-key public services, then computes real km distance with the
// Haversine formula:
//
//   1. api.postalpincode.in — official India Post data, pincode -> post
//      office / district / state name. Free, no key, no rate limit stated.
//   2. nominatim.openstreetmap.org — OpenStreetMap's free geocoder, turns
//      that place name into a lat/long. Free, no key, but asks for a
//      descriptive User-Agent and ~1 request/second (we respect that).
//
// Every resolved pincode is cached in MongoDB (see models/PincodeLocation.js)
// so each pincode is only ever looked up once — after that it's a plain DB
// read, so normal traffic never touches the external APIs and there's no
// per-request slowdown or cost.

import PincodeLocation from "../models/PincodeLocation.js";

const EARTH_RADIUS_KM = 6371;
const NOMINATIM_USER_AGENT = "ServioApp/1.0 (contact: support@servio.in)";

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Real great-circle distance between two lat/long points, in kilometres.
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

// Looks up district/state for a pincode via India Post's public API.
async function fetchPostalInfo(pincode) {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const office = data?.[0]?.PostOffice?.[0];
  if (!office) return null;
  return { district: office.District, state: office.State, area: office.Name };
}

// Turns a place name into coordinates via OpenStreetMap Nominatim.
async function geocodePlace(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": NOMINATIM_USER_AGENT },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results?.[0]) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

// Resolves a pincode to { lat, lng }, using the DB cache first and only
// hitting the external APIs on a cache miss. Returns null if the pincode
// genuinely can't be resolved (e.g. invalid pincode).
export async function resolvePincode(pincode) {
  if (!/^\d{6}$/.test(pincode)) return null;

  const cached = await PincodeLocation.findOne({ pincode });
  if (cached) {
    return cached.status === "resolved" ? { lat: cached.lat, lng: cached.lng } : null;
  }

  try {
    const postal = await fetchPostalInfo(pincode);
    if (!postal) {
      await PincodeLocation.create({ pincode, lat: 0, lng: 0, status: "failed" });
      return null;
    }

    // Geocode "<district>, <state>, India" for the best match.
    const place = await geocodePlace(`${postal.district}, ${postal.state}, India`);
    if (!place) {
      await PincodeLocation.create({ pincode, lat: 0, lng: 0, status: "failed" });
      return null;
    }

    await PincodeLocation.create({
      pincode,
      lat: place.lat,
      lng: place.lng,
      district: postal.district,
      state: postal.state,
      status: "resolved",
    });
    return { lat: place.lat, lng: place.lng };
  } catch (err) {
    // Network hiccup / API down — don't cache a permanent failure for a
    // transient error, just report unresolved for this request.
    console.error(`[geo] Failed to resolve pincode ${pincode}:`, err.message);
    return null;
  }
}

// Real km distance between two pincodes (all-India, via resolvePincode).
// Returns null if either pincode can't be resolved.
export async function distanceBetweenPincodesKm(pincodeA, pincodeB) {
  if (pincodeA === pincodeB) return 0;
  const [a, b] = await Promise.all([resolvePincode(pincodeA), resolvePincode(pincodeB)]);
  if (!a || !b) return null;
  return haversineDistanceKm(a.lat, a.lng, b.lat, b.lng);
}