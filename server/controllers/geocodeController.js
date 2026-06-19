import { fetchReverseGeocode } from '../utils/geocode.js';

export const reverseGeocode = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const { address, approximate } = await fetchReverseGeocode(lat, lng);

    return res.json({
      success: true,
      address,
      approximate: Boolean(approximate),
    });
  } catch (error) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const fallback =
      Number.isNaN(lat) || Number.isNaN(lng)
        ? ''
        : `Near ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    return res.json({
      success: true,
      address: fallback,
      approximate: true,
    });
  }
};
