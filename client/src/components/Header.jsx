import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getAuth, getPostAuthPath } from '../services/auth';
import './Header.css';

const navLinks = [
  { label: 'Home', path: '/#home' },
  { label: 'Features', path: '/#features' },
  { label: 'How It Works', path: '/#how-it-works' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dashboardPath, setDashboardPath] = useState('/dashboard');
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const auth = getAuth();
    if (!auth?.user) {
      setUser(null);
      setDashboardPath('/dashboard');
      return;
    }

    setUser(auth.user);
    setDashboardPath(getPostAuthPath(auth.user, auth.user?.pendingLinkCount));
  }, [location.pathname]);

  const isActive = (path) => {
    if (path.startsWith('/#')) return location.pathname === '/' && location.hash === path.slice(1);
    return location.pathname === path;
  };

  const initials = user?.fullName
    ? user.fullName
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const authActions = user ? (
    <Link
      to={dashboardPath}
      className="header__user"
      onClick={() => setMenuOpen(false)}
      title="Go to dashboard"
    >
      <span className="header__user-avatar">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.fullName} />
        ) : (
          <span>{initials}</span>
        )}
      </span>
      <span className="header__user-name">{user.fullName}</span>
    </Link>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>
        Login
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
        Get Started
      </Link>
    </>
  );

  return (
    <header className="header">
      <div className="container header__inner">
        <BrandLogo
          to="/"
          size={36}
          subtitle="Digital Baki, Smart Pasal"
          className="header__logo"
          onClick={() => setMenuOpen(false)}
        />

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <div className="header__nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`header__link ${isActive(link.path) ? 'header__link--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="header__nav-actions">
            {authActions}
          </div>
        </nav>

        <div className="header__actions">
          {authActions}
        </div>

        <button
          type="button"
          className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="header__overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}
    </header>
  );
}

export default Header;
