import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="app-page-header">
      <div className="app-page-header__main">
        {breadcrumbs.length > 0 && (
          <nav className="app-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.label} className="app-breadcrumbs__item">
                {index > 0 && <ChevronRight size={14} className="app-breadcrumbs__sep" />}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h2 className="app-page-header__title">{title}</h2>
        {subtitle && <p className="app-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="app-page-header__actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
