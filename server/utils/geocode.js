const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'BakiBook/1.0 (shop-verification@bakibook.app)';

export function formatCoordinateFallback(lat, lng) {
  return `Near ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function uniqueParts(parts) {
  const seen = new Set();
  return parts
    .map((part) => (part == null ? '' : String(part).trim()))
    .filter((part) => {
      if (!part) return false;
      const key = part.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function buildAddressFromNominatim(data, lat, lng) {
  if (data?.error) {
    return { address: formatCoordinateFallback(lat, lng), approximate: true };
  }

  const addr = data?.address || {};
  const fromParts = uniqueParts([
    addr.amenity || addr.building || addr.shop || addr.office,
    addr.house_number,
    addr.road || addr.pedestrian || addr.footway,
    addr.neighbourhood || addr.suburb || addr.quarter || addr.hamlet,
    addr.city_district || addr.district || addr.county,
    addr.city || addr.town || addr.village || addr.municipality,
    addr.state,
    addr.postcode,
    addr.country,
  ]).join(', ');

  const displayName = data?.display_name?.trim();
  const address = fromParts || displayName || formatCoordinateFallback(lat, lng);
  const approximate = !fromParts && !displayName;

  return { address, approximate };
}

export async function fetchReverseGeocode(lat, lng) {
  const url = `${NOMINATIM_BASE}?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': USER_AGENT,
      },
    });

    if (response.status === 429 || response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const retry = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en',
          'User-Agent': USER_AGENT,
        },
      });
      if (!retry.ok) {
        return { address: formatCoordinateFallback(lat, lng), approximate: true };
      }
      const retryData = await retry.json();
      return buildAddressFromNominatim(retryData, lat, lng);
    }

    if (!response.ok) {
      return { address: formatCoordinateFallback(lat, lng), approximate: true };
    }

    const data = await response.json();
    return buildAddressFromNominatim(data, lat, lng);
  } catch {
    return { address: formatCoordinateFallback(lat, lng), approximate: true };
  } finally {
    clearTimeout(timeout);
  }
}
