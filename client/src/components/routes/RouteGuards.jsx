import { Navigate } from 'react-router-dom';
import { getAuth, getPostAuthPath, canAccessAdmin, canAccessShopkeeper, canAccessCustomer } from '../../services/auth';

function roleHome(user) {
  return getPostAuthPath(user, user?.pendingLinkCount);
}

export function ProtectedRoute({ children }) {
  if (!getAuth()) return <Navigate to="/login" replace />;
  return children;
}

export function ShopkeeperRoute({ children }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (canAccessAdmin(auth.user)) return <Navigate to="/admin" replace />;
  if (!canAccessShopkeeper(auth.user)) return <Navigate to={roleHome(auth.user)} replace />;
  return children;
}

export function CustomerRoute({ children }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (canAccessAdmin(auth.user)) return <Navigate to="/admin" replace />;
  if (auth.user.role === 'shopkeeper') return <Navigate to="/dashboard" replace />;
  if (!canAccessCustomer(auth.user)) return <Navigate to={roleHome(auth.user)} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!canAccessAdmin(auth.user)) return <Navigate to={roleHome(auth.user)} replace />;
  return children;
}

export function GuestRoute({ children }) {
  const auth = getAuth();
  if (auth) {
    return <Navigate to={roleHome(auth.user)} replace />;
  }
  return children;
}
