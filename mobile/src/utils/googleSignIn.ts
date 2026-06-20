import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveGoogleWebClientId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
  if (fromEnv) return fromEnv;

  const fromExtra = Constants.expoConfig?.extra?.googleWebClientId;
  return typeof fromExtra === 'string' ? fromExtra.trim() : '';
}

const webClientId = resolveGoogleWebClientId();

let configured = false;

export function isGoogleSignInConfigured(): boolean {
  return Boolean(webClientId);
}

export function configureGoogleSignIn() {
  if (!isGoogleSignInConfigured() || configured) return;
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  configured = true;
}

export async function getGoogleIdToken(): Promise<string> {
  if (!isGoogleSignInConfigured()) {
    throw new Error('Google sign-in is not configured for this app build.');
  }

  configureGoogleSignIn();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type === 'cancelled') {
    throw new Error('Google sign-in was cancelled');
  }

  const idToken = response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
  if (!idToken) {
    throw new Error('Google sign-in did not return a token. Check your Google OAuth client setup.');
  }

  return idToken;
}

export function getGoogleSignInErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String((error as { code: string }).code);
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      return 'Google sign-in was cancelled';
    }
    if (code === statusCodes.IN_PROGRESS) {
      return 'Google sign-in is already in progress';
    }
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return 'Google Play Services is not available on this device';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Google sign-in failed. Please try again.';
}
