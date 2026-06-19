import LegalDocumentPage from './LegalDocumentPage';

function LegalDataPolicy() {
  return (
    <LegalDocumentPage
      slug="data-policy"
      docLabel="Privacy Policy"
      backTo="/register"
      backLabel="Back to register"
    />
  );
}

export default LegalDataPolicy;
