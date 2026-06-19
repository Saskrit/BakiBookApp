import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, FileText, Loader2 } from 'lucide-react';
import LegalDocumentContent from './LegalDocumentContent';
import { formatLegalDate } from '../services/legal';
import '../pages/LegalPage.css';

function LegalPageLayout({
  title,
  lastUpdated,
  sections,
  loading,
  error,
  backTo = '/',
  backLabel = 'Back',
  docLabel = 'Legal',
}) {
  return (
    <div className="legal-page">
      <header className="legal-page__header glass-header">
        <Link to="/" className="legal-page__brand">
          <BookOpen size={22} />
          <span>BakiBook</span>
        </Link>
        <Link to={backTo} className="legal-page__back">
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
      </header>

      <main className="legal-page__main">
        <div className="legal-page__hero">
          <span className="legal-page__badge">
            <FileText size={14} />
            {docLabel}
          </span>
          <h1>{title || 'Loading...'}</h1>
          {lastUpdated && (
            <p className="legal-page__hero-meta">
              Effective from {formatLegalDate(lastUpdated)}
            </p>
          )}
        </div>

        {loading && (
          <div className="legal-page__state">
            <Loader2 size={28} className="auth-spinner" />
            <p>Loading document...</p>
          </div>
        )}

        {error && !loading && (
          <div className="legal-page__state legal-page__state--error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && sections?.length > 0 && (
          <div className="legal-page__layout">
            <aside className="legal-page__toc" aria-label="Table of contents">
              <p className="legal-page__toc-label">On this page</p>
              <nav>
                <ul>
                  {sections.map((section, index) => (
                    <li key={`${section.title}-${index}`}>
                      <a href={`#section-${index + 1}`}>{section.title}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            <div className="legal-page__content">
              <LegalDocumentContent sections={sections} />
            </div>
          </div>
        )}

        {!loading && !error && lastUpdated && (
          <footer className="legal-page__footer">
            <CalendarDays size={16} />
            <span>
              Last updated: <strong>{formatLegalDate(lastUpdated)}</strong>
            </span>
          </footer>
        )}
      </main>
    </div>
  );
}

export default LegalPageLayout;
