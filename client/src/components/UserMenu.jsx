import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  Store,
} from 'lucide-react';
import { logout, getPostAuthPath } from '../services/auth';
import './UserMenu.css';

function UserMenu({ user, variant = 'header' }) {
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const initials = user?.fullName
    ? user.fullName
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const shopDisplay = user?.shopName?.trim() || 'Not set yet';
  const hasShopName = Boolean(user?.shopName?.trim());
  const homePath = getPostAuthPath(user, user?.pendingLinkCount);
  const homeLabel = user?.isAdmin ? 'Admin Panel' : 'Dashboard';
  const settingsPath = user?.isAdmin ? '/admin/settings' : user?.role === 'shopkeeper' ? '/shop/settings' : '/portal/profile';
  const settingsLabel = user?.isAdmin ? 'Admin Settings' : user?.role === 'shopkeeper' ? 'Shop Settings' : 'Profile Settings';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    window.location.href = '/login';
  };

  return (
    <div className={`user-menu user-menu--${variant}`} ref={menuRef}>
      <button
        type="button"
        className={`user-menu__trigger ${open ? 'user-menu__trigger--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="user-menu__avatar">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.fullName} />
          ) : (
            <span>{initials}</span>
          )}
        </span>

        <span className="user-menu__meta">
          <strong>{user?.fullName || 'User'}</strong>
          {user?.role === 'shopkeeper' && (
            <span className={hasShopName ? 'user-menu__shop' : 'user-menu__shop user-menu__shop--empty'}>
              <Store size={12} />
              {shopDisplay}
            </span>
          )}
          {user?.role === 'customer' && (
            <span className="user-menu__role">Customer</span>
          )}
        </span>

        <ChevronDown size={16} className={`user-menu__chevron ${open ? 'user-menu__chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="user-menu__dropdown">
          <div className="user-menu__dropdown-head">
            <span className="user-menu__dropdown-avatar">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} />
              ) : (
                <span>{initials}</span>
              )}
            </span>
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.email}</span>
              {user?.role === 'shopkeeper' && (
                <span className={hasShopName ? 'user-menu__dropdown-shop' : 'user-menu__dropdown-shop user-menu__dropdown-shop--empty'}>
                  {shopDisplay}
                </span>
              )}
            </div>
          </div>

          <div className="user-menu__dropdown-body">
            <Link to={settingsPath} className="user-menu__item" onClick={() => setOpen(false)}>
              <Settings size={16} />
              {settingsLabel}
            </Link>
            <Link to={homePath} className="user-menu__item" onClick={() => setOpen(false)}>
              <LayoutDashboard size={16} />
              {homeLabel}
            </Link>
          </div>

          <div className="user-menu__dropdown-foot">
            <button type="button" className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
