export const getAdminEnvEmail = () =>
  (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

export const getAdminEnvPassword = () => process.env.ADMIN_PASSWORD || '';

export const getAdminEmails = () => {
  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const envEmail = getAdminEnvEmail();
  if (envEmail && !emails.includes(envEmail)) {
    emails.push(envEmail);
  }

  return emails;
};

export const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
};

export const matchesAdminCredentials = (email, password) => {
  const adminEmail = getAdminEnvEmail();
  const adminPassword = getAdminEnvPassword();
  if (!adminEmail || !adminPassword) return false;

  return email.trim().toLowerCase() === adminEmail && password === adminPassword;
};

export const isAdminLoginConfigured = () =>
  Boolean(getAdminEnvEmail() && getAdminEnvPassword());
