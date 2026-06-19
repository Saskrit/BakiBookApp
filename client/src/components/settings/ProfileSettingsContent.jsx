import { Link } from 'react-router-dom';
import {
  UserCircle,
  Lock,
  Store,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import ProfilePicturePicker from '../ProfilePicturePicker';
import ShopDetailsFields from '../ShopDetailsFields';
import { getShopStatus } from '../../hooks/useProfileSettings';
import './SettingsLayout.css';

const DEFAULT_SECTIONS = {
  shopkeeper: ['account', 'shop', 'security'],
  customer: ['account', 'security'],
};

function shopStatusLabel(status) {
  if (status === 'verified') return 'verified';
  if (status === 'pending') return 'pending review';
  if (status === 'rejected') return 'rejected';
  return 'incomplete';
}

function shopStatusBadge(status, embedded) {
  if (status === 'verified') {
    return (
      <span className={`${embedded ? 'app-badge app-badge--success' : 'profile-panel__tag profile-panel__tag--success'}`}>
        <CheckCircle2 size={12} /> Verified Shop
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className={`${embedded ? 'app-badge app-badge--warn' : 'profile-panel__tag profile-panel__tag--pending'}`}>
        <AlertCircle size={12} /> Awaiting review
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className={`${embedded ? 'app-badge app-badge--danger' : 'profile-panel__tag profile-panel__tag--danger'}`}>
        <AlertCircle size={12} /> Declined
      </span>
    );
  }
  return null;
}

function EmbeddedSectionHead({ title, description, badge }) {
  return (
    <div className="settings-panel__head">
      <div className="settings-panel__head-text">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {badge}
    </div>
  );
}

function ProfileBadges({ user }) {
  const shopStatus = getShopStatus(user);

  return (
    <div className="profile-hero__badges">
      <span className="profile-badge profile-badge--role">
        {user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer'}
      </span>
      {user.authProvider !== 'google' && (
        <span className={`profile-badge ${user.isEmailVerified ? 'profile-badge--ok' : 'profile-badge--warn'}`}>
          {user.isEmailVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          Email {user.isEmailVerified ? 'verified' : 'pending'}
        </span>
      )}
      {user.role === 'shopkeeper' && (
        <span className={`profile-badge ${
          shopStatus === 'verified'
            ? 'profile-badge--ok'
            : shopStatus === 'pending'
              ? 'profile-badge--info'
              : 'profile-badge--warn'
        }`}>
          {shopStatus === 'verified' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          Shop {shopStatusLabel(shopStatus)}
        </span>
      )}
    </div>
  );
}

export default function ProfileSettingsContent({
  user,
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
  activeSection,
  setActiveSection,
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
  sections: sectionsProp,
  showPreferences = false,
  embedded = false,
  fullPage = false,
}) {
  const sections = sectionsProp || DEFAULT_SECTIONS[user.role] || DEFAULT_SECTIONS.customer;
  const shopDisplay = user.shopName?.trim() || 'Not set yet';
  const shopStatus = getShopStatus(user);

  const panelClass = embedded ? 'settings-panel app-card' : 'profile-panel';
  const fieldClass = embedded ? 'app-field' : 'profile-field';
  const submitClass = embedded ? 'app-btn app-btn--primary app-btn--sm' : 'profile-btn';
  const formClass = embedded ? 'app-form' : undefined;

  const isSectionVisible = (key) => fullPage || activeSection === key;

  const sectionLabels = {
    account: { icon: UserCircle, label: 'Account' },
    shop: { icon: Store, label: 'Shop' },
    security: { icon: Lock, label: 'Security' },
    preferences: { icon: SlidersHorizontal, label: 'Preferences' },
  };

  const rootClass = [
    embedded ? 'settings-embedded' : 'profile-content',
    fullPage ? 'settings-embedded--full' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {!embedded && (
        <div className="profile-hero">
          <div className="profile-hero__avatar">
            {user.profileImage || accountForm.profileImage ? (
              <img src={accountForm.profileImage || user.profileImage} alt={user.fullName} />
            ) : (
              <span>{user.fullName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="profile-hero__info">
            <h1>{user.fullName}</h1>
            <p>{user.email}</p>
            {user.role === 'shopkeeper' && (
              <p className={`profile-hero__shop ${!user.shopName?.trim() ? 'profile-hero__shop--empty' : ''}`}>
                <Store size={14} />
                {shopDisplay}
              </p>
            )}
            <ProfileBadges user={user} />
          </div>
        </div>
      )}

      {embedded && (
        <div className="settings-summary">
          <div className="settings-summary__avatar">
            {user.profileImage || accountForm.profileImage ? (
              <img src={accountForm.profileImage || user.profileImage} alt={user.fullName} />
            ) : (
              <span>{user.fullName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="settings-summary__info">
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
            {user.role === 'shopkeeper' && (
              <span className="settings-summary__shop">
                <Store size={12} />
                {shopDisplay}
              </span>
            )}
            <ProfileBadges user={user} />
          </div>
        </div>
      )}

      {message && <p className="profile-alert profile-alert--success">{message}</p>}
      {error && <p className="profile-alert profile-alert--error">{error}</p>}

      {!fullPage && (
        <nav
          className={embedded ? 'settings-tabs' : 'profile-tabs'}
          aria-label="Settings sections"
        >
          {sections.map((key) => {
            const item = sectionLabels[key];
            if (!item) return null;
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                type="button"
                className={
                  embedded
                    ? `settings-tabs__btn ${isActive ? 'settings-tabs__btn--active' : ''}`
                    : `profile-tabs__btn ${isActive ? 'profile-tabs__btn--active' : ''}`
                }
                onClick={() => {
                  setActiveSection(key);
                  setError('');
                }}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {fullPage && user.role === 'shopkeeper' && shopStatus !== 'verified' && (
        <div className={embedded ? 'app-card app-settings-hint' : 'profile-hint'}>
          <ShieldCheck size={18} />
          <span>
            {shopStatus === 'pending'
              ? 'Your shop is awaiting admin verification.'
              : 'Complete your shop details below and submit for admin verification.'}
          </span>
        </div>
      )}

      {isSectionVisible('account') && (
        <section className={panelClass}>
          {embedded ? (
            <EmbeddedSectionHead
              title="Account Details"
              description="Update your display name and profile picture."
            />
          ) : (
            <div className="profile-panel__head">
              <h2>Account Details</h2>
              <p>Update your display name and profile picture.</p>
            </div>
          )}
          <form className={formClass} onSubmit={handleSaveAccount}>
            <ProfilePicturePicker
              value={accountForm.profileImage}
              onChange={(value) => setAccountForm((prev) => ({ ...prev, profileImage: value }))}
              onError={setError}
              disabled={savingAccount}
              name={accountForm.fullName}
            />
            <div className={fieldClass}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                value={accountForm.fullName}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className={fieldClass}>
              <label>Email Address</label>
              <input value={user.email} disabled />
              {!user.isEmailVerified && user.authProvider !== 'google' && (
                <Link to="/verify-email" className={embedded ? 'app-link-btn' : 'profile-field__link'}>
                  Verify email address
                </Link>
              )}
            </div>
            <div className={embedded ? 'settings-form-footer' : undefined}>
              <button type="submit" className={submitClass} disabled={savingAccount}>
                {savingAccount ? <Loader2 size={16} className="auth-spinner" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>
      )}

      {isSectionVisible('shop') && user.role === 'shopkeeper' && (
        <section className={panelClass} id="settings-shop">
          {embedded ? (
            <EmbeddedSectionHead
              title="Shop Details"
              description={
                shopStatus === 'verified'
                  ? 'Your shop is verified. Update details if anything changes.'
                  : shopStatus === 'pending'
                    ? 'Your shop details are with the admin for verification.'
                    : 'Add your shop information and submit for admin verification.'
              }
              badge={shopStatusBadge(shopStatus, embedded)}
            />
          ) : (
            <div className="profile-panel__head">
              <h2>Shop Details</h2>
              <p>
                {shopStatus === 'verified'
                  ? 'Your shop is verified. Update details if anything changes.'
                  : shopStatus === 'pending'
                    ? 'Your shop details are with the admin for verification.'
                    : 'Add your shop information and submit for admin verification.'}
              </p>
              {shopStatusBadge(shopStatus, false)}
            </div>
          )}
          {shopStatus === 'pending' && (
            <p className="profile-alert profile-alert--info">
              An admin will review your shop name, location, and photo. You will be notified once verified.
            </p>
          )}
          <form className={formClass} onSubmit={handleSaveShop}>
            <ShopDetailsFields
              form={shopForm}
              onChange={(name, value) => setShopForm((prev) => ({ ...prev, [name]: value }))}
              onImageChange={(value) => setShopForm((prev) => ({ ...prev, shopImage: value }))}
              locating={locating}
              onLocatingChange={setLocating}
              onError={setError}
              disabled={savingShop || locating}
              idPrefix="settings"
            />
            <div className={embedded ? 'settings-form-footer' : undefined}>
              <button type="submit" className={submitClass} disabled={savingShop || locating}>
                {savingShop ? <Loader2 size={16} className="auth-spinner" /> : shopStatus === 'verified' ? 'Update Shop Details' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </section>
      )}

      {isSectionVisible('security') && (
        <section className={panelClass}>
          {embedded ? (
            <EmbeddedSectionHead
              title="Password & Security"
              description={
                user.authProvider === 'google'
                  ? 'Set a password to also sign in with email and password.'
                  : 'Update your account password.'
              }
            />
          ) : (
            <div className="profile-panel__head">
              <h2>Password & Security</h2>
              <p>
                {user.authProvider === 'google'
                  ? 'Set a password to also sign in with email and password.'
                  : 'Update your account password.'}
              </p>
            </div>
          )}
          <form className={formClass} onSubmit={handleSavePassword}>
            <div className={fieldClass}>
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
              />
            </div>
            <div className={fieldClass}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>
            <div className={embedded ? 'settings-form-footer' : undefined}>
              <button type="submit" className={submitClass} disabled={savingPassword}>
                {savingPassword ? <Loader2 size={16} className="auth-spinner" /> : 'Update Password'}
              </button>
            </div>
          </form>
        </section>
      )}

      {showPreferences && isSectionVisible('preferences') && (
        <section className={panelClass}>
          {embedded ? (
            <EmbeddedSectionHead
              title="App Preferences"
              description="Defaults used across your shop dashboard and reminders."
            />
          ) : (
            <div className="profile-panel__head">
              <h2>App Preferences</h2>
              <p>Defaults used across your shop dashboard and reminders.</p>
            </div>
          )}
          <form className={formClass} onSubmit={handleSavePreferences}>
            <div className={fieldClass}>
              <label htmlFor="currency">Default currency</label>
              <select
                id="currency"
                value={preferencesForm.currency}
                onChange={(e) => setPreferencesForm((prev) => ({ ...prev, currency: e.target.value }))}
              >
                <option value="NPR">NPR (Rs.)</option>
              </select>
            </div>
            <div className={fieldClass}>
              <label htmlFor="dueReminderDays">Due reminder threshold (days)</label>
              <input
                id="dueReminderDays"
                type="number"
                min="1"
                max="90"
                value={preferencesForm.dueReminderDays}
                onChange={(e) =>
                  setPreferencesForm((prev) => ({
                    ...prev,
                    dueReminderDays: Number(e.target.value) || 7,
                  }))
                }
              />
              <p className={embedded ? 'app-field__hint' : 'profile-field__hint'}>
                Customers with dues older than this appear in due reminders.
              </p>
            </div>
            <div className={fieldClass}>
              <label htmlFor="emailNotifications">In-app notifications</label>
              <select
                id="emailNotifications"
                value={preferencesForm.emailNotifications ? 'enabled' : 'disabled'}
                onChange={(e) =>
                  setPreferencesForm((prev) => ({
                    ...prev,
                    emailNotifications: e.target.value === 'enabled',
                  }))
                }
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className={embedded ? 'settings-form-footer' : undefined}>
              <button type="submit" className={submitClass} disabled={savingPreferences}>
                {savingPreferences ? <Loader2 size={16} className="auth-spinner" /> : 'Save Preferences'}
              </button>
            </div>
          </form>
        </section>
      )}

      {!fullPage && user.role === 'shopkeeper' && shopStatus !== 'verified' && activeSection !== 'shop' && (
        <div className={embedded ? 'app-card app-settings-hint' : 'profile-hint'}>
          <ShieldCheck size={18} />
          <span>
            {shopStatus === 'pending'
              ? 'Your shop is awaiting admin verification.'
              : (
                <>
                  Complete shop details in the <button type="button" onClick={() => setActiveSection('shop')}>Shop</button> tab to submit for verification.
                </>
              )}
          </span>
        </div>
      )}
    </div>
  );
}
