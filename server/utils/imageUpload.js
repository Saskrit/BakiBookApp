import fs from 'fs/promises';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

const CLOUDINARY_FOLDERS = {
  profiles: 'bakibook/profiles',
  shops: 'bakibook/shops',
  payments: 'bakibook/payments',
};

const getPublicBaseUrl = () =>
  process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`;

export const uploadLocalFileToCloudinary = async (filePath, type = 'profiles') => {
  const folder = CLOUDINARY_FOLDERS[type] || CLOUDINARY_FOLDERS.profiles;

  if (!isCloudinaryConfigured()) {
    return null;
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  });

  return result.secure_url;
};

export const uploadRemoteImageToCloudinary = async (imageUrl, type = 'profiles') => {
  if (!imageUrl || !isCloudinaryConfigured()) {
    return imageUrl || '';
  }

  if (imageUrl.includes('res.cloudinary.com')) {
    return imageUrl;
  }

  const folder = CLOUDINARY_FOLDERS[type] || CLOUDINARY_FOLDERS.profiles;

  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: 'image',
  });

  return result.secure_url;
};

export const processUploadedFile = async (file, type = 'profiles') => {
  const folderName = type === 'shop' ? 'shops' : type === 'payment' ? 'payments' : 'profiles';
  const localUrl = `${getPublicBaseUrl()}/uploads/${folderName}/${file.filename}`;

  let cloudinaryUrl = null;

  try {
    cloudinaryUrl = await uploadLocalFileToCloudinary(file.path, folderName);
  } catch (error) {
    console.error('Cloudinary upload failed, using local file:', error.message);
  }

  return {
    url: cloudinaryUrl || localUrl,
    localUrl,
    cloudinaryUrl,
    filename: file.filename,
  };
};

export const resolveImageUrl = async (value, type = 'profiles') => {
  if (!value) return '';

  if (value.includes('res.cloudinary.com')) {
    return value;
  }

  if (value.startsWith('data:image/')) {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary is not configured for image uploads');
    }

    const folder = CLOUDINARY_FOLDERS[type] || CLOUDINARY_FOLDERS.profiles;
    const result = await cloudinary.uploader.upload(value, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    if (isCloudinaryConfigured()) {
      try {
        return await uploadRemoteImageToCloudinary(value, type);
      } catch (error) {
        console.error('Remote image Cloudinary upload failed:', error.message);
        return value;
      }
    }
    return value;
  }

  return value;
};

export const removeLocalFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing temp files.
  }
};
