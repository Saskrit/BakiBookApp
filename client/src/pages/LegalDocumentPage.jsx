import { useEffect, useState } from 'react';
import LegalPageLayout from '../components/LegalPageLayout';
import { fetchLegalDocument } from '../services/legal';

function LegalDocumentPage({ slug, docLabel, backTo = '/', backLabel = 'Back' }) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await fetchLegalDocument(slug);
        if (active) setDocument(data.document);
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
  }, [slug]);

  return (
    <LegalPageLayout
      title={document?.title}
      lastUpdated={document?.lastUpdated}
      sections={document?.sections}
      loading={loading}
      error={error}
      backTo={backTo}
      backLabel={backLabel}
      docLabel={docLabel}
    />
  );
}

export default LegalDocumentPage;
