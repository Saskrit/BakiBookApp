import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users, FileText, BarChart3, Settings, Menu, X, Shield, LogOut } from 'lucide-react';
import BrandLogo from '../BrandLogo';
import { logout } from '../../services/auth';
import './AdminLayout.css';

const navSections = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
      { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: Store, label: 'Shops', to: '/admin/shops' },
      { icon: Users, label: 'Users', to: '/admin/users' },
      { icon: FileText, label: 'Reports', to: '/admin/reports' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { icon: Shield, label: 'Legal Content', to: '/admin/legal' },
      { icon: Settings, label: 'Settings', to: '/admin/settings' },
    ],
  },
];

function getInitials(user) {
  const name = user?.fullName || user?.email || 'A';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function AdminLayout({ user, children, pageTitle = 'Admin Panel', pageSubtitle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${menuOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__top">
          <BrandLogo
            to="/admin"
            size={28}
            title="BakiBook Admin"
            subtitle="Admin Panel"
            className="admin-sidebar__brand"
          />
          <button type="button" onClick={() => setMenuOpen(false)} className="admin-sidebar__close">
            <X size={20} />
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="admin-sidebar__section">{section.label}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar__foot">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__avatar">{getInitials(user)}</span>
            <div className="admin-sidebar__user-info">
              <span>{user?.fullName || 'Administrator'}</span>
              <small>{user?.email}</small>
            </div>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button type="button" className="admin-layout__overlay" onClick={() => setMenuOpen(false)} aria-label="Close" />
      )}

      <div className="admin-layout__main">
        <header className="admin-header glass-header">
          <button type="button" className="admin-header__menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="admin-header__text">
            <h1>{pageTitle}</h1>
            {pageSubtitle && <p className="admin-header__subtitle">{pageSubtitle}</p>}
          </div>
          <button type="button" className="app-btn app-btn--outline admin-header__logout" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </header>
        <div className="admin-layout__content">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
