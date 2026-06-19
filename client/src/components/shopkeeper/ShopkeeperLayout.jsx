import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Bell,
  FileText,
  Settings,
  Calendar,
  ClipboardList,
  Menu,
  X,
  AlarmClock,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import UserMenu from '../UserMenu';
import BrandLogo from '../BrandLogo';
import NotificationBellDropdown from '../notifications/NotificationBellDropdown';
import { fetchUnreadNotificationCount } from '../../services/ledger';
import { fetchUnreadMessageCount } from '../../services/messages';
import { fetchPendingSubmissionCount } from '../../services/paymentSubmissions';
import { resolveNotificationLink } from '../../utils/notificationLinks';
import { useSocketEvent } from '../../contexts/SocketProvider';
import './ShopkeeperLayout.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', key: 'dashboard' },
  { icon: Users, label: 'Customers', href: '/shop/customers', key: 'customers' },
  { icon: MessageCircle, label: 'Messages', href: '/shop/messages', key: 'messages' },
  { icon: ArrowLeftRight, label: 'Credits & Payments', href: '/shop/transactions', key: 'transactions' },
  { icon: ClipboardList, label: 'Ledger', href: '/shop/ledger', key: 'ledger' },
  { icon: AlarmClock, label: 'Due Reminders', href: '/shop/reminders', key: 'reminders' },
  { icon: FileText, label: 'Reports', href: '/shop/reports', key: 'reports' },
  { icon: Bell, label: 'Notifications', href: '/shop/notifications', key: 'notifications' },
  { icon: Settings, label: 'Settings', href: '/shop/settings', key: 'settings' },
];

const SIDEBAR_COLLAPSED_KEY = 'bakibook_sidebar_collapsed';

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ShopkeeperLayout({
  user,
  children,
  onMenuToggle,
  sidebarOpen,
  activeNav = 'dashboard',
  pageTitle,
  pageSubtitle,
  fullPage = false,
}) {
  const firstName = user.fullName?.split(' ')[0] || 'Shopkeeper';
  const headerTitle = pageTitle || `Namaste, ${firstName} 👋`;
  const headerSubtitle = pageSubtitle || "Here's what's happening in your shop today.";
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

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

  const loadUnreadCount = (nextCount) => {
    if (typeof nextCount === 'number') {
      setUnreadCount(nextCount);
      return;
    }
    fetchUnreadNotificationCount()
      .then((data) => setUnreadCount(data?.count || 0))
      .catch(() => setUnreadCount(0));
  };

  const loadMessageUnreadCount = (nextCount) => {
    if (typeof nextCount === 'number') {
      setMessageUnreadCount(nextCount);
      return;
    }
    fetchUnreadMessageCount()
      .then((data) => setMessageUnreadCount(data?.count || 0))
      .catch(() => setMessageUnreadCount(0));
  };

  const loadPendingPaymentCount = (nextCount) => {
    if (typeof nextCount === 'number') {
      setPendingPaymentCount(nextCount);
      return;
    }
    fetchPendingSubmissionCount()
      .then((data) => setPendingPaymentCount(data?.count || 0))
      .catch(() => setPendingPaymentCount(0));
  };

  const refreshBadges = () => {
    loadUnreadCount();
    loadMessageUnreadCount();
    loadPendingPaymentCount();
  };

  useEffect(() => {
    refreshBadges();
    const handleUpdate = () => refreshBadges();
    window.addEventListener('bakibook:notifications-updated', handleUpdate);
    return () => window.removeEventListener('bakibook:notifications-updated', handleUpdate);
  }, []);

  useSocketEvent('notification:new', loadUnreadCount, []);
  useSocketEvent('notification:count', (payload) => loadUnreadCount(payload?.count), []);
  useSocketEvent('message:new', loadMessageUnreadCount, []);
  useSocketEvent('message:unread-count', (payload) => loadMessageUnreadCount(payload?.count), []);
  useSocketEvent('payment-submission:count', (payload) => loadPendingPaymentCount(payload?.count), []);

  return (
    <div className={`sk-layout ${fullPage ? 'sk-layout--full-page' : ''} ${sidebarCollapsed ? 'sk-layout--sidebar-collapsed' : ''}`}>
      <aside
        className={`sk-sidebar ${sidebarOpen ? 'sk-sidebar--open' : ''} ${sidebarCollapsed ? 'sk-sidebar--collapsed' : ''}`}
      >
        <div className="sk-sidebar__top">
          <BrandLogo
            to="/"
            size={32}
            subtitle="Digital Baki, Smart Pasal"
            className="sk-sidebar__brand"
            titleAttr={sidebarCollapsed ? 'BakiBook' : undefined}
            onClick={() => sidebarOpen && onMenuToggle()}
          />
          <button
            type="button"
            className="sk-sidebar__close"
            onClick={onMenuToggle}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sk-sidebar__nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`sk-sidebar__link ${activeNav === item.key ? 'sk-sidebar__link--active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => sidebarOpen && onMenuToggle()}
            >
              <item.icon size={18} />
              <span className="sk-sidebar__link-label">{item.label}</span>
              {item.key === 'notifications' && unreadCount > 0 && (
                <span className="sk-sidebar__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
              {item.key === 'messages' && messageUnreadCount > 0 && (
                <span className="sk-sidebar__badge">{messageUnreadCount > 99 ? '99+' : messageUnreadCount}</span>
              )}
              {item.key === 'transactions' && pendingPaymentCount > 0 && (
                <span className="sk-sidebar__badge">{pendingPaymentCount > 99 ? '99+' : pendingPaymentCount}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sk-sidebar__foot">
          <button
            type="button"
            className="sk-sidebar__collapse-btn"
            onClick={toggleSidebarCollapse}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            <span className="sk-sidebar__collapse-label">
              {sidebarCollapsed ? 'Expand' : 'Collapse'}
            </span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="sk-layout__overlay"
          onClick={onMenuToggle}
          aria-label="Close menu overlay"
        />
      )}

      <div className="sk-layout__main">
        {!fullPage && (
          <header className="sk-header glass-header">
            <div className="sk-header__left">
              <button
                type="button"
                className="sk-header__menu"
                onClick={onMenuToggle}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <button
                type="button"
                className="sk-header__collapse"
                onClick={toggleSidebarCollapse}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
              <div>
                <h1>{headerTitle}</h1>
                <p>{headerSubtitle}</p>
              </div>
            </div>

            <div className="sk-header__right">
              <time className="sk-header__today" dateTime={new Date().toISOString().split('T')[0]}>
                <Calendar size={16} aria-hidden />
                {formatTodayLabel()}
              </time>

              <NotificationBellDropdown
                unreadCount={unreadCount}
                onCountChange={loadUnreadCount}
                seeAllLink="/shop/notifications"
                limit={5}
                resolveLink={resolveNotificationLink}
              />

              <UserMenu user={user} variant="header" />
            </div>
          </header>
        )}

        <div className={`sk-layout__content ${fullPage ? 'sk-layout__content--full' : ''}`}>{children}</div>

        {!fullPage && (
          <footer className="sk-footer">
            <p>© {new Date().getFullYear()} BakiBook. All rights reserved.</p>
            <p>Made with ❤️ in Nepal 🇳🇵</p>
          </footer>
        )}
      </div>
    </div>
  );
}

export default ShopkeeperLayout;
