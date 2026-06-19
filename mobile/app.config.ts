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
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#4C5C2D',
    },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bakibook.app',
    infoPlist: {
      NSCameraUsageDescription:
        'BakiBook uses the camera to scan customer QR codes.',
    },
  },
  android: {
    package: 'com.bakibook.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#4C5C2D',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    permissions: ['CAMERA'],
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow BakiBook to access your camera to scan customer QR codes.',
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
