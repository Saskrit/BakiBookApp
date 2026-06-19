import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  CalendarDays,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { getAuth, getPostAuthPath } from '../services/auth';
import { fetchLegalDocument, updateLegalDocument, formatLegalDate } from '../services/legal';
import AdminLayout from '../components/layouts/AdminLayout';
import PageHeader from '../components/app/PageHeader';
import '../components/app/AppPages.css';
import './AdminLegal.css';

const TABS = [
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'data-policy', label: 'Privacy Policy' },
];

const emptySection = () => ({
  title: '',
  paragraphs: [''],
  bullets: [],
  subsections: [],
  contactEmail: '',
});

function linesToBullets(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function bulletsToLines(bullets = []) {
  return bullets.join('\n');
}

function paragraphsToText(paragraphs = []) {
  return paragraphs.join('\n\n');
}

function textToParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function AdminLegal() {
  const auth = getAuth();
  const [activeSlug, setActiveSlug] = useState('terms');
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.user?.isAdmin) return;

    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      setMessage('');

      try {
        const data = await fetchLegalDocument(activeSlug);
        if (!active) return;
        setTitle(data.document.title);
        setSections(data.document.sections.length ? data.document.sections : [emptySection()]);
        setLastUpdated(data.document.lastUpdated);
      } catch (err) {
        if (active) setError(err.message || 'Failed to load document');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [activeSlug, auth?.user?.isAdmin]);

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (!auth.user.isAdmin) {
    return <Navigate to={getPostAuthPath(auth.user, auth.user.pendingLinkCount)} replace />;
  }

  const updateSection = (index, field, value) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, [field]: value } : section))
    );
  };

  const addSection = () => {
    setSections((prev) => [...prev, emptySection()]);
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    const cleanedSections = sections
      .map((section) => ({
        title: section.title.trim(),
        paragraphs: (section.paragraphs || []).map((p) => p.trim()).filter(Boolean),
        bullets: (section.bullets || []).map((b) => b.trim()).filter(Boolean),
        subsections: (section.subsections || [])
          .map((sub) => ({
            title: sub.title?.trim() || '',
            paragraphs: (sub.paragraphs || []).map((p) => p.trim()).filter(Boolean),
            bullets: (sub.bullets || []).map((b) => b.trim()).filter(Boolean),
          }))
          .filter((sub) => sub.title || sub.paragraphs.length || sub.bullets.length),
        contactEmail: section.contactEmail?.trim() || '',
      }))
      .filter(
        (section) =>
          section.title ||
          section.paragraphs.length ||
          section.bullets.length ||
          section.subsections.length ||
          section.contactEmail
      );

    try {
      const data = await updateLegalDocument(activeSlug, {
        title: title.trim(),
        sections: cleanedSections,
      });
      setTitle(data.document.title);
      setSections(data.document.sections);
      setLastUpdated(data.document.lastUpdated);
      setMessage('Document saved successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout user={auth.user} pageTitle="Legal Content" pageSubtitle="Edit public-facing legal documents">
      <PageHeader
        title="Legal Documents"
        subtitle="Edit Terms & Conditions and Privacy Policy content shown on public pages."
      />

      {lastUpdated && (
        <p className="admin-legal__updated">
          <CalendarDays size={15} />
          Last updated: <strong>{formatLegalDate(lastUpdated)}</strong>
        </p>
      )}

      <div className="admin-legal__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            className={`admin-legal__tab ${activeSlug === tab.slug ? 'admin-legal__tab--active' : ''}`}
            onClick={() => setActiveSlug(tab.slug)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-legal__error">{error}</p>}
      {message && <p className="admin-legal__success">{message}</p>}

      {loading ? (
        <div className="admin-legal__loading">
          <Loader2 size={24} className="auth-spinner" />
          <span>Loading document...</span>
        </div>
      ) : (
        <div className="admin-legal__editor">
          <div className="admin-legal__field">
            <label htmlFor="doc-title">Page title</label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="admin-legal__sections">
            {sections.map((section, index) => (
              <div key={index} className="admin-legal__section-card">
                <div className="admin-legal__section-head">
                  <h2>Section {index + 1}</h2>
                  <button
                    type="button"
                    className="admin-legal__icon-btn"
                    onClick={() => removeSection(index)}
                    aria-label={`Remove section ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="admin-legal__field">
                  <label>Section title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="e.g. 1. Acceptance of Terms"
                  />
                </div>

                <div className="admin-legal__field">
                  <label>Paragraphs (separate with a blank line)</label>
                  <textarea
                    rows={4}
                    value={paragraphsToText(section.paragraphs)}
                    onChange={(e) =>
                      updateSection(index, 'paragraphs', textToParagraphs(e.target.value))
                    }
                  />
                </div>

                <div className="admin-legal__field">
                  <label>Bullet points (one per line)</label>
                  <textarea
                    rows={4}
                    value={bulletsToLines(section.bullets)}
                    onChange={(e) => updateSection(index, 'bullets', linesToBullets(e.target.value))}
                  />
                </div>

                <div className="admin-legal__field">
                  <label>Contact email (optional)</label>
                  <input
                    type="email"
                    value={section.contactEmail || ''}
                    onChange={(e) => updateSection(index, 'contactEmail', e.target.value)}
                    placeholder="support@bakibook.com"
                  />
                </div>

                <div className="admin-legal__subsections">
                  <div className="admin-legal__subsections-head">
                    <p className="admin-legal__subsections-label">Subsections (optional)</p>
                    <button
                      type="button"
                      className="admin-legal__btn admin-legal__btn--outline admin-legal__btn--small"
                      onClick={() =>
                        updateSection(index, 'subsections', [
                          ...(section.subsections || []),
                          { title: '', paragraphs: [], bullets: [] },
                        ])
                      }
                    >
                      <Plus size={14} />
                      Add subsection
                    </button>
                  </div>
                  {(section.subsections || []).map((subsection, subIndex) => (
                    <div key={subIndex} className="admin-legal__subsection-card">
                      <input
                        type="text"
                        value={subsection.title || ''}
                        onChange={(e) => {
                          const next = [...(section.subsections || [])];
                          next[subIndex] = { ...next[subIndex], title: e.target.value };
                          updateSection(index, 'subsections', next);
                        }}
                        placeholder="Subsection title"
                      />
                      <textarea
                        rows={3}
                        value={bulletsToLines(subsection.bullets)}
                        onChange={(e) => {
                          const next = [...(section.subsections || [])];
                          next[subIndex] = {
                            ...next[subIndex],
                            bullets: linesToBullets(e.target.value),
                          };
                          updateSection(index, 'subsections', next);
                        }}
                        placeholder="Bullets, one per line"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-legal__actions">
            <button type="button" className="admin-legal__btn admin-legal__btn--outline" onClick={addSection}>
              <Plus size={16} />
              Add section
            </button>
            <button
              type="button"
              className="admin-legal__btn admin-legal__btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="auth-spinner" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminLegal;
