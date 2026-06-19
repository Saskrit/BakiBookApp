import request from './api';
import { fetchPendingLinks } from './links';

const AUTH_KEY = 'bakibook_auth';

export const saveAuth = (token, user, pendingLinkCount) => {
  localStorage.setItem('bakibook_token', token);
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      ...user,
      ...(pendingLinkCount != null ? { pendingLinkCount } : {}),
    })
  );
};

export const getAuth = () => {
  const token = localStorage.getItem('bakibook_token');
  const userJson = localStorage.getItem(AUTH_KEY);

  if (!token || !userJson) return null;

  try {
    return { token, user: JSON.parse(userJson) };
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('bakibook_token');
  localStorage.removeItem(AUTH_KEY);
};

export const register = (payload) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const login = (payload) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const googleAuth = (payload) =>
  request('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateProfile = (payload) =>
  request('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const needsShopSetup = (user) =>
  user?.role === 'shopkeeper' &&
  (user?.shopVerificationStatus
    ? user.shopVerificationStatus !== 'verified'
    : Boolean(user?.needsShopSetup) || !user?.isShopVerified);

export const isShopPendingVerification = (user) =>
  user?.role === 'shopkeeper' && user?.shopVerificationStatus === 'pending';

export function getPostAuthPath(user, pendingLinkCount) {
  if (user?.isAdmin) return '/admin';
  if (user?.role === 'shopkeeper') return '/dashboard';
  if (user?.role === 'customer') {
    const count = pendingLinkCount ?? user?.pendingLinkCount ?? 0;
    if (count > 0) return '/portal/link-shops';
    return '/portal';
  }
  return '/dashboard';
}

export function getRoleHomePath(user, pendingLinkCount) {
  return getPostAuthPath(user, pendingLinkCount);
}

export function canAccessAdmin(user) {
  return Boolean(user?.isAdmin);
}

export function canAccessShopkeeper(user) {
  return user?.role === 'shopkeeper' && !user?.isAdmin;
}

export function canAccessCustomer(user) {
  return user?.role === 'customer' && !user?.isAdmin;
}

export async function resolvePostAuthPath(user, pendingLinkCount) {
  if (pendingLinkCount != null) {
    return getPostAuthPath(user, pendingLinkCount);
  }

  if (user?.role === 'customer') {
    try {
      const data = await fetchPendingLinks();
      return getPostAuthPath(user, data.count);
    } catch {
      return '/portal';
    }
  }

  return getPostAuthPath(user);
}

export const getGoogleAuthRedirectPath = () => '/auth/redirect';

export const fetchMe = () => request('/auth/me');

export const verifyEmailToken = (token) => request(`/auth/verify-email/${token}`);

export const verifyEmail = verifyEmailToken;

export const resendVerification = () =>
  request('/auth/resend-verification', { method: 'POST' });

export const forgotPassword = (email) =>
  request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token, password) =>
  request(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });

export const logout = () => {
  clearAuth();
};
