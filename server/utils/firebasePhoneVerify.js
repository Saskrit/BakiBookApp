const lookupFirebaseUser = async (idToken) => {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('Firebase API key is not configured on the server');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Invalid Firebase token');
  }

  return data.users?.[0] || null;
};

export const verifyFirebasePhoneToken = async (idToken, expectedPhone) => {
  const firebaseUser = await lookupFirebaseUser(idToken);

  if (!firebaseUser) {
    throw new Error('Invalid verification token');
  }

  const verifiedPhone = firebaseUser.phoneNumber;

  if (!verifiedPhone) {
    throw new Error('Phone number was not verified by Firebase');
  }

  const normalize = (value) => value.replace(/\D/g, '');

  if (normalize(verifiedPhone) !== normalize(expectedPhone)) {
    throw new Error('Verified phone number does not match');
  }

  return verifiedPhone;
};
