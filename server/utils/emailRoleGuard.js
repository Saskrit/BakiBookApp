import User from '../models/User.js';

const roleLabel = (role) => (role === 'shopkeeper' ? 'shopkeeper' : 'customer');

/**
 * Ensures an email is not already registered under a different role.
 * Returns { ok: true } or { ok: false, status, message }.
 */
export const assertEmailAvailableForRole = async (email, intendedRole) => {
  const normalized = email.trim().toLowerCase();
  const users = await User.find({ email: normalized }).select('role email');

  if (!users.length) {
    return { ok: true };
  }

  const sameRole = users.find((user) => user.role === intendedRole);
  if (sameRole) {
    return {
      ok: false,
      status: 409,
      message:
        intendedRole === 'customer'
          ? 'Email address is already registered. Please login instead.'
          : 'Email address is already registered',
    };
  }

  const existing = users[0];
  return {
    ok: false,
    status: 409,
    message: `This email is already registered as a ${roleLabel(existing.role)}. Each email can only be used for one account type.`,
  };
};
