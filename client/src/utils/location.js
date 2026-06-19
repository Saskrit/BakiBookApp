const GEO_ERROR_MESSAGES = {
  1: 'Location permission denied. Allow location access in your browser settings.',
  2: 'Location unavailable. Enter your shop address manually.',
  3: 'Location request timed out. Try again or enter the address manually.',
};

export async function reverseGeocode(lat, lng) {
  let response;

  try {
    response = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
    );
  } catch {
    throw new Error('Could not reach the address service. Check your connection or type the address manually.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Could not resolve address. Enter your shop address manually.');
  }

  if (!data.address?.trim()) {
    throw new Error('No address found for your location. Enter your shop address manually.');
  }

  return {
    address: data.address.trim(),
    approximate: Boolean(data.approximate),
  };
}

export function getCurrentLocationAddress() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(GEO_ERROR_MESSAGES[error.code] || 'Unable to access your location.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload a valid image file'));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error('Image must be smaller than 2MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
