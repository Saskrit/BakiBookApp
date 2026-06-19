import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportCustomerFullReport } from '../../utils/exportCustomerReport';

export default function CustomerReportDownloadButton({
  customerId,
  shopName,
  className = 'app-btn app-btn--outline app-btn--sm',
  label = 'Download PDF',
}) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!customerId) return;
    setExporting(true);
    try {
      await exportCustomerFullReport(customerId, shopName);
    } catch (err) {
      window.alert(err.message || 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleExport}
      disabled={exporting || !customerId}
    >
      <Download size={16} /> {exporting ? 'Generating…' : label}
    </button>
  );
}
