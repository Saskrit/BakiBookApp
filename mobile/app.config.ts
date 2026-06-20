import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    name: 'BakiBook',
    slug: 'bakibook',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#4C5C2D',
    },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bakibook.app',
    infoPlist: {
      NSCameraUsageDescription:
        'BakiBook uses the camera to scan customer QR codes and update profile photos.',
      NSPhotoLibraryUsageDescription:
        'BakiBook uses your photo library to update your profile and shop photos.',
    },
  },
  android: {
    package: 'com.bakibook.app',
    versionCode: 6,
    adaptiveIcon: {
      backgroundColor: '#4C5C2D',
      foregroundImage: './assets/icon.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['CAMERA'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    './plugins/withBakiBookAndroid.js',
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow BakiBook to access your camera to scan customer QR codes and take photos.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow BakiBook to access your photos to update profile and shop images.',
        cameraPermission:
          'Allow BakiBook to use your camera to take profile and shop photos.',
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: '2a61e05a-bb22-4d04-9f06-2d7a4bfc5871',
    },
  },
  owner: 'saskreet',
  }) as ExpoConfig;
