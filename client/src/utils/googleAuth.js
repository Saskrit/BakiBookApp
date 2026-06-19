export function decodeGoogleCredential(credential) {
  if (!credential) return null;

  try {
    const payload = JSON.parse(atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));

    return {
      googleId: payload.sub || '',
      fullName: payload.name || '',
      email: payload.email || '',
      picture: payload.picture || '',
      emailVerified: payload.email_verified,
    };
  } catch {
    return null;
  }
}
