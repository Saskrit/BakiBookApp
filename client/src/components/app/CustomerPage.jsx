import { useState, createContext, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import { getAuth, getPostAuthPath, canAccessCustomer } from '../../services/auth';

const CustomerShellContext = createContext({ toggleMenu: () => {} });

export function useCustomerShell() {
  return useContext(CustomerShellContext);
}

function CustomerPage({ user, activeNav, pageTitle, pageSubtitle, fullPage = false, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleMenu = () => setSidebarOpen((open) => !open);

  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessCustomer(user)) {
    return <Navigate to={getPostAuthPath(user, user?.pendingLinkCount)} replace />;
  }

  return (
    <CustomerShellContext.Provider value={{ toggleMenu }}>
      <CustomerLayout
        user={user}
        activeNav={activeNav}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        fullPage={fullPage}
        sidebarOpen={sidebarOpen}
        onMenuToggle={toggleMenu}
      >
        {children}
      </CustomerLayout>
    </CustomerShellContext.Provider>
  );
}

export function useCustomerUser() {
  const auth = getAuth();
  return auth?.user;
}

export default CustomerPage;
