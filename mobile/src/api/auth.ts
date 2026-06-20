import AsyncStorage from '@react-native-async-storage/async-storage';
import { request, setToken } from './client';
import type { AuthResponse, User } from '../types';

const AUTH_KEY = 'bakibook_auth';

export async function saveAuth(token: string, user: User, pendingLinkCount?: number) {
  await setToken(token);
  await AsyncStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      ...user,
      ...(pendingLinkCount != null ? { pendingLinkCount } : {}),
    })
  );
}

export async function getStoredAuth(): Promise<{ token: string; user: User } | null> {
  const token = await AsyncStorage.getItem('bakibook_token');
  const userJson = await AsyncStorage.getItem(AUTH_KEY);
  if (!token || !userJson) return null;
  try {
    return { token, user: JSON.parse(userJson) as User };
  } catch {
    return null;
  }
}

export async function clearAuth() {
  await setToken(null);
  await AsyncStorage.removeItem(AUTH_KEY);
}

export const login = (payload: { email: string; password: string }) => {
  const email = payload.email.trim();
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: email,
      email,
      password: payload.password,
    }),
  });
};

export const register = (payload: {
  role: 'shopkeeper' | 'customer';
  fullName: string;
  email: string;
  password: string;
}) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchMe = () => request<{ success: boolean; user: User }>('/auth/me');

export const updateProfile = (payload: Record<string, unknown>) =>
  request<{ success: boolean; message: string; user: User }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const fetchPendingLinks = () =>
  request<{ success: boolean; count: number }>('/links/pending');
