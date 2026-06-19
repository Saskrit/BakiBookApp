import Constants from 'expo-constants';

const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

function resolveApiBaseUrl(): string {
  if (fromExtra?.trim()) return fromExtra.trim();
  if (fromEnv?.trim()) return fromEnv.trim();

  if (__DEV__) {
    if (debuggerHost) return `http://${debuggerHost}:5001/api`;
    return 'http://10.0.2.2:5001/api';
  }

  // Release builds must be configured at build time (EAS secret or eas.json env).
  console.warn(
    'EXPO_PUBLIC_API_URL is not set. Set it in eas.json or: eas secret:create --name EXPO_PUBLIC_API_URL'
  );
  return '';
}

export const API_BASE_URL = resolveApiBaseUrl();
