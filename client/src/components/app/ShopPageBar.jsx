import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function ShopPageBar({ breadcrumbs = [], actions }) {
  if (!breadcrumbs.length && !actions) return null;

  return (
    <div className="sk-page-bar">
      {breadcrumbs.length > 0 && (
        <nav className="sk-page-bar__crumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="sk-page-bar__crumb">
              {index > 0 && <ChevronRight size={14} className="sk-page-bar__sep" aria-hidden />}
              {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </span>
          ))}
        </nav>
      )}
      {actions && <div className="sk-page-bar__actions">{actions}</div>}
    </div>
  );
}

export default ShopPageBar;
