import { fetchSharedCredits } from '../services/shared';
import { downloadCustomerReportPdf } from './customerReportPdf';

export async function exportCustomerFullReport(customerId, shopName) {
  const data = await fetchSharedCredits(customerId);

  downloadCustomerReportPdf({
    shopName: shopName || data.shop?.name || 'Shop',
    shopOwner: data.shop?.owner || '',
    customer: data.customer,
    summary: data.summary,
    ledger: data.ledger || [],
    credits: data.transactions || [],
    payments: data.payments || [],
  });
}
