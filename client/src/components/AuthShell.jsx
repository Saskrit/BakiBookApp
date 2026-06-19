import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Users } from 'lucide-react';
import BrandLogo from './BrandLogo';
import './AuthShell.css';

const highlights = [
  { icon: Shield, text: 'Secure email-based accounts' },
  { icon: TrendingUp, text: 'Track credit & payments digitally' },
  { icon: Users, text: 'Built for shopkeepers & customers' },
];

function AuthShell({ children, backTo = '/', backLabel = 'Back' }) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__aside" aria-hidden="true">
        <div className="auth-shell__aside-bg">
          <span className="auth-shell__orb auth-shell__orb--1" />
          <span className="auth-shell__orb auth-shell__orb--2" />
          <span className="auth-shell__grid" />
        </div>

        <BrandLogo to="/" size={32} className="auth-shell__brand" />

        <div className="auth-shell__pitch">
          <span className="auth-shell__label">Digital Baki Platform</span>
          <h2>
            Smart pasal.
            <br />
            <span>Zero notebook chaos.</span>
          </h2>
          <p>
            Manage credit, payments, and customer records in one modern dashboard — designed
            for local shopkeepers across Nepal.
          </p>

          <ul className="auth-shell__highlights">
            {highlights.map((item) => (
              <li key={item.text}>
                <item.icon size={16} />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-shell__aside-foot">&copy; {new Date().getFullYear()} BakiBook</p>
      </aside>

      <div className="auth-shell__main">
        <div className="auth-shell__topbar">
          <Link to={backTo} className="auth-shell__back">
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </Link>
          <BrandLogo to="/" size={24} className="auth-shell__brand-mobile" />
        </div>

        <div className="auth-shell__content">{children}</div>
      </div>
    </div>
  );
}

export default AuthShell;
