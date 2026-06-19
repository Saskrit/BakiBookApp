import { useEffect, useState, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookText,
  Receipt,
  Wallet,
  Bell,
  User,
  Menu,
  X,
  Store,
  Link2,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import UserMenu from '../UserMenu';
import BrandLogo from '../BrandLogo';
import NotificationBellDropdown from '../notifications/NotificationBellDropdown';
import { fetchUnreadNotificationCount } from '../../services/ledger';
import { resolveCustomerNotificationLink } from '../../utils/notificationLinks';
import { useSocketEvent } from '../../contexts/SocketProvider';
import './CustomerLayout.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/portal', key: 'dashboard' },
  { icon: Store, label: 'My Shops', to: '/portal/shops', key: 'shops' },
  { icon: MessageCircle, label: 'Messages', to: '/portal/messages', key: 'messages' },
  { icon: Link2, label: 'Shop Invites', to: '/portal/link-shops', key: 'link-shops' },
  { icon: BookText, label: 'My Ledger', to: '/portal/ledger', key: 'ledger' },
  { icon: Receipt, label: 'Transactions', to: '/portal/transactions', key: 'transactions' },
  { icon: Wallet, label: 'Payments', to: '/portal/payments', key: 'payments' },
  { icon: Bell, label: 'Notifications', to: '/portal/notifications', key: 'notifications' },
  { icon: User, label: 'My Profile', to: '/portal/profile', key: 'profile' },
];

const SIDEBAR_COLLAPSED_KEY = 'bakibook_customer_sidebar_collapsed';

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function CustomerLayout({
  user,
  children,
  pageTitle,
  pageSubtitle,
  activeNav,
  fullPage = false,
  sidebarOpen = false,
  onMenuToggle = () => {},
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);
  const [unreadCount, setUnreadCount] = useState(0);
  const firstName = user?.fullName?.split(' ')[0] || 'Customer';

  const loadUnreadCount = useCallback((count) => {
    if (typeof count === 'number') {
      setUnreadCount(count);
      return;
    }
    fetchUnreadNotificationCount()
      .then((data) => setUnreadCount(data?.count || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const handleUpdate = () => loadUnreadCount();
    window.addEventListener('bakibook:notifications-updated', handleUpdate);
    return () => window.removeEventListener('bakibook:notifications-updated', handleUpdate);
  }, [loadUnreadCount]);

  useSocketEvent('notification:new', loadUnreadCount, [loadUnreadCount]);
  useSocketEvent('notification:count', (payload) => loadUnreadCount(payload?.count), [loadUnreadCount]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    if (!fullPage) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [fullPage]);

  return (
    <div className={`cust-layout ${fullPage ? 'cust-layout--full-page' : ''} ${sidebarCollapsed ? 'cust-layout--sidebar-collapsed' : ''}`}>
      <aside
        className={`cust-sidebar ${sidebarOpen ? 'cust-sidebar--open' : ''} ${sidebarCollapsed ? 'cust-sidebar--collapsed' : ''}`}
      >
        <div className="cust-sidebar__top">
          <BrandLogo
            to="/"
            size={32}
            subtitle="Customer Portal"
            className="cust-sidebar__brand"
            titleAttr={sidebarCollapsed ? 'BakiBook' : undefined}
            onClick={() => sidebarOpen && onMenuToggle()}
          />
          <button type="button" className="cust-sidebar__close" onClick={onMenuToggle} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="cust-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/portal'}
              className={({ isActive }) =>
                `cust-sidebar__link ${isActive || activeNav === item.key ? 'cust-sidebar__link--active' : ''}`
              }
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => sidebarOpen && onMenuToggle()}
            >
              <item.icon size={18} />
              <span className="cust-sidebar__link-label">{item.label}</span>
              {item.key === 'notifications' && unreadCount > 0 && (
                <span className="cust-sidebar__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="cust-sidebar__foot">
          <button
            type="button"
            className="cust-sidebar__collapse-btn"
            onClick={toggleSidebarCollapse}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span className="cust-sidebar__collapse-label">
              {sidebarCollapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button type="button" className="cust-layout__overlay" onClick={onMenuToggle} aria-label="Close menu overlay" />
      )}

      <div className="cust-layout__main">
        {!fullPage && (
          <header className="cust-header glass-header">
            <div className="cust-header__left">
              <button type="button" className="cust-header__menu" onClick={onMenuToggle} aria-label="Open menu">
                <Menu size={22} />
              </button>
              <button
                type="button"
                className="cust-header__collapse"
                onClick={toggleSidebarCollapse}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
              <div>
                <h1>{pageTitle || `Hello, ${firstName}`}</h1>
                <p>{pageSubtitle || 'View your credit account and payments'}</p>
              </div>
            </div>
            <div className="cust-header__right">
              <NotificationBellDropdown
                unreadCount={unreadCount}
                onCountChange={loadUnreadCount}
                seeAllLink="/portal/notifications"
                limit={5}
                resolveLink={resolveCustomerNotificationLink}
                triggerClassName="cust-header__icon-btn notif-bell__trigger"
              />
              <UserMenu user={user} variant="header" />
            </div>
          </header>
        )}
        <div className={`cust-layout__content ${fullPage ? 'cust-layout__content--full' : ''}`}>{children}</div>
      </div>
    </div>
  );
}

export default CustomerLayout;
