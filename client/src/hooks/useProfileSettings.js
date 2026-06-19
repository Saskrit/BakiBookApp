import { useState } from 'react';
import { getAuth, saveAuth, updateProfile } from '../services/auth';

export function getShopStatus(user) {
  if (user.shopVerificationStatus) return user.shopVerificationStatus;
  return user.isShopVerified ? 'verified' : 'incomplete';
}

const PREFERENCES_KEY = 'bakibook_shop_preferences';

export function loadShopPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {
    dueReminderDays: 7,
    emailNotifications: true,
    currency: 'NPR',
  };
}

export function saveShopPreferences(prefs) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function useProfileSettings() {
  const auth = getAuth();
  const [user, setUser] = useState(auth?.user);
  const [activeSection, setActiveSection] = useState('account');
  const [accountForm, setAccountForm] = useState({
    fullName: auth?.user?.fullName || '',
    profileImage: auth?.user?.profileImage || '',
  });
  const [shopForm, setShopForm] = useState({
    shopName: auth?.user?.shopName || '',
    shopLocation: auth?.user?.shopLocation || '',
    shopImage: auth?.user?.shopImage || '',
  });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [preferencesForm, setPreferencesForm] = useState(loadShopPreferences);
  const [locating, setLocating] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingShop, setSavingShop] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const updateUser = (updated) => {
    setUser(updated);
    saveAuth(auth.token, updated);
    setAccountForm((prev) => ({
      ...prev,
      fullName: updated.fullName,
      profileImage: updated.profileImage || '',
    }));
    setShopForm({
      shopName: updated.shopName || '',
      shopLocation: updated.shopLocation || '',
      shopImage: updated.shopImage || '',
    });
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    setError('');
    setMessage('');
    try {
      const data = await updateProfile({
        fullName: accountForm.fullName.trim(),
        profileImage: accountForm.profileImage,
      });
      updateUser(data.user);
      setMessage('Account details saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSaveShop = async (e) => {
    e.preventDefault();
    setSavingShop(true);
    setError('');
    setMessage('');
    try {
      const data = await updateProfile({
        shopName: shopForm.shopName.trim(),
        shopLocation: shopForm.shopLocation.trim(),
        shopImage: shopForm.shopImage,
      });
      updateUser(data.user);
      const status = getShopStatus(data.user);
      if (status === 'pending') {
        setMessage('Shop details submitted. An admin will verify your shop soon.');
      } else if (status === 'verified') {
        setMessage('Shop details updated successfully.');
      } else {
        setMessage('Shop details saved.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingShop(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    setError('');
    setMessage('');
    try {
      await updateProfile({ password: passwordForm.password });
      setPasswordForm({ password: '', confirmPassword: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPreferences(true);
    setError('');
    setMessage('');
    try {
      saveShopPreferences(preferencesForm);
      setMessage('Preferences saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPreferences(false);
    }
  };

  return {
    auth,
    user,
    activeSection,
    setActiveSection,
    accountForm,
    setAccountForm,
    shopForm,
    setShopForm,
    passwordForm,
    setPasswordForm,
    preferencesForm,
    setPreferencesForm,
    locating,
    setLocating,
    savingAccount,
    savingShop,
    savingPassword,
    savingPreferences,
    message,
    error,
    setError,
    handleSaveAccount,
    handleSaveShop,
    handleSavePassword,
    handleSavePreferences,
  };
}
