import { useState, createContext, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import ShopkeeperLayout from '../shopkeeper/ShopkeeperLayout';
import ShopPageBar from './ShopPageBar';
import { getAuth, getPostAuthPath, canAccessShopkeeper } from '../../services/auth';

const ShopkeeperShellContext = createContext({ toggleMenu: () => {} });

export function useShopkeeperShell() {
  return useContext(ShopkeeperShellContext);
}

function ShopkeeperPage({
  user,
  activeNav,
  pageTitle,
  pageSubtitle,
  breadcrumbs,
  actions,
  fullPage = false,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleMenu = () => setSidebarOpen((o) => !o);

  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessShopkeeper(user)) {
    return <Navigate to={getPostAuthPath(user, user?.pendingLinkCount)} replace />;
  }

  return (
    <ShopkeeperShellContext.Provider value={{ toggleMenu }}>
      <ShopkeeperLayout
        user={user}
        activeNav={activeNav}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        fullPage={fullPage}
        sidebarOpen={sidebarOpen}
        onMenuToggle={toggleMenu}
      >
        {!fullPage && <ShopPageBar breadcrumbs={breadcrumbs} actions={actions} />}
        {children}
      </ShopkeeperLayout>
    </ShopkeeperShellContext.Provider>
  );
}

export function useShopkeeperUser() {
  const auth = getAuth();
  return auth?.user;
}

export default ShopkeeperPage;
