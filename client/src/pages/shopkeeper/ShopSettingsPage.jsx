import { Navigate } from 'react-router-dom';
import ShopkeeperPage from '../../components/app/ShopkeeperPage';
import ProfileSettingsContent from '../../components/settings/ProfileSettingsContent';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { getPostAuthPath, canAccessShopkeeper } from '../../services/auth';
import './ShopSettings.css';

const SHOPKEEPER_SECTIONS = ['account', 'shop', 'security', 'preferences'];

export function ShopSettingsPage() {
  const settings = useProfileSettings();

  if (!settings.auth) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessShopkeeper(settings.user)) {
    return <Navigate to={getPostAuthPath(settings.user, settings.user.pendingLinkCount)} replace />;
  }

  return (
    <ShopkeeperPage
      user={settings.user}
      activeNav="settings"
      pageTitle="Settings"
      pageSubtitle="Account, shop profile, and preferences"
    >
      <div className="shop-settings">
        <ProfileSettingsContent
          {...settings}
          embedded
          fullPage
          sections={SHOPKEEPER_SECTIONS}
          showPreferences
        />
      </div>
    </ShopkeeperPage>
  );
}
