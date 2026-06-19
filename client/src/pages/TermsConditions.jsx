import LegalDocumentPage from './LegalDocumentPage';

function TermsConditions() {
  return (
    <LegalDocumentPage
      slug="terms"
      docLabel="Terms & Conditions"
      backTo="/register"
      backLabel="Back to register"
    />
  );
}

export default TermsConditions;
