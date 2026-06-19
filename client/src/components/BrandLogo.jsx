import { Link } from 'react-router-dom';
import './BrandLogo.css';

export const LOGO_SRC = '/bakibook.png';

export default function BrandLogo({
  to = '/',
  size = 32,
  showText = true,
  title = 'BakiBook',
  subtitle = '',
  className = '',
  onClick,
  titleAttr,
}) {
  return (
    <Link
      to={to}
      className={`brand-logo ${className}`.trim()}
      onClick={onClick}
      title={titleAttr || (showText ? undefined : title)}
    >
      <img
        src={LOGO_SRC}
        alt={title}
        className="brand-logo__img"
        width={size}
        height={size}
      />
      {showText && (
        <div className="brand-logo__text">
          <span>{title}</span>
          {subtitle ? <small>{subtitle}</small> : null}
        </div>
      )}
    </Link>
  );
}
