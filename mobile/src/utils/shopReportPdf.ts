import {
  PDF_STYLES,
  buildTableHtml,
  escapeHtml,
  formatReportDate,
  formatRs,
  shareHtmlAsPdf,
} from './pdfHtml';

type CompleteReportPayload = {
  period: string;
  shopName?: string;
  shopOwner?: string;
  report: Record<string, unknown>;
  credits?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  activity?: Array<Record<string, unknown>>;
  customers?: Array<Record<string, unknown>>;
  outstanding?: Array<Record<string, unknown>>;
};

function summaryItems(report: Record<string, unknown>) {
  return [
    ['Period start', formatReportDate(String(report.periodStart || ''))],
    ['Period end', formatReportDate(String(report.periodEnd || ''))],
    ['Credit given', formatRs(Number(report.creditGiven || 0))],
    ['Payments received', formatRs(Number(report.paymentsReceived || 0))],
    ['Credit transactions', String(report.transactionCount ?? 0)],
    ['Payment records', String(report.paymentCount ?? 0)],
    ['Product line items', String(report.productCount ?? 0)],
    ['Total customers', String(report.customerCount ?? 0)],
    ['Customers with dues', String(report.customersWithDues ?? 0)],
    ['Total outstanding', formatRs(Number(report.totalOutstanding || 0))],
  ];
}

export async function exportCompleteShopReportPdf(data: CompleteReportPayload) {
  const { period, shopName, shopOwner, report } = data;
  const statsHtml = summaryItems(report)
    .map(([label, value]) => `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join('');

  const creditsHtml = buildTableHtml(data.credits, [
    { label: 'Date', key: 'date' },
    { label: 'Customer', key: 'customer' },
    { label: 'Products', key: 'products' },
    { label: 'Total', key: 'total', format: (v) => formatRs(Number(v)) },
    { label: 'Note', key: 'note' },
  ]);

  const paymentsHtml = buildTableHtml(data.payments, [
    { label: 'Date', key: 'date' },
    { label: 'Customer', key: 'customer' },
    { label: 'Paid for', key: 'paidFor' },
    { label: 'Amount', key: 'amount', format: (v) => formatRs(Number(v)) },
    { label: 'Method', key: 'method' },
    { label: 'Receipt', key: 'receiptNo' },
  ]);

  const productsHtml = buildTableHtml(data.products, [
    { label: 'Date', key: 'date' },
    { label: 'Customer', key: 'customer' },
    { label: 'Product', key: 'product' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit price', key: 'price', format: (v) => formatRs(Number(v)) },
    { label: 'Line total', key: 'total', format: (v) => formatRs(Number(v)) },
  ]);

  const activityHtml = buildTableHtml(data.activity, [
    { label: 'Date', key: 'date' },
    { label: 'Type', key: 'type' },
    { label: 'Customer', key: 'customer' },
    { label: 'Details', key: 'details' },
    { label: 'Amount', key: 'amount', format: (v) => formatRs(Number(v)) },
  ]);

  const customersHtml = buildTableHtml(data.customers, [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Balance', key: 'balance', format: (v) => formatRs(Number(v)) },
    { label: 'Credit score', key: 'creditScore' },
    { label: 'Status', key: 'status' },
  ]);

  const outstandingHtml = buildTableHtml(data.outstanding, [
    { label: 'Name', key: 'name' },
    { label: 'Phone', key: 'phone' },
    { label: 'Outstanding', key: 'balance', format: (v) => formatRs(Number(v)) },
    { label: 'Credit score', key: 'creditScore' },
  ]);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>${PDF_STYLES}</style></head><body>
    <h1>BakiBook — ${escapeHtml(period)} report</h1>
    <div class="meta">
      <div><strong>${escapeHtml(shopName || 'Shop')}</strong>${shopOwner ? ` · ${escapeHtml(shopOwner)}` : ''}</div>
      <div>Generated: ${formatReportDate(new Date().toISOString())}</div>
    </div>
    <h2>Summary</h2>
    <div class="stats">${statsHtml}</div>
    <h2>Credit transactions</h2>${creditsHtml}
    <h2>Payments received</h2>${paymentsHtml}
    <h2>Products sold on credit</h2>${productsHtml}
    <h2>Activity log</h2>${activityHtml}
    <h2>All customers</h2>${customersHtml}
    <h2>Outstanding balances</h2>${outstandingHtml}
    <div class="footer">BakiBook shop report</div>
  </body></html>`;

  await shareHtmlAsPdf(html, 'Export shop report');
}
