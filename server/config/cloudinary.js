import { v2 as cloudinary } from 'cloudinary';

const parseCloudinaryUrl = (url) => {
  const match = url?.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
  if (!match) return null;

  return {
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
  };
};

export const isCloudinaryConfigured = () => Boolean(parseCloudinaryUrl(process.env.CLOUDINARY_URL));

if (process.env.CLOUDINARY_URL) {
  const credentials = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

  if (credentials) {
    cloudinary.config({
      ...credentials,
      secure: true,
    });
  } else {
    console.warn('CLOUDINARY_URL is set but could not be parsed');
  }
}

export default cloudinary;

export const verifyCloudinaryConnection = async () => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  try {
    await cloudinary.api.ping();
    console.log('Cloudinary connection verified');
    return true;
  } catch (error) {
    console.warn('Cloudinary connection failed:', error.message);
    return false;
  }
};
