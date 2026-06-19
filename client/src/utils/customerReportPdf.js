import { formatRs } from './format';
import { printHtmlDocument } from './shopReportPdf';

function formatReportDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTableHtml(rows, columns) {
  if (!rows?.length) {
    return '<p class="empty">No records.</p>';
  }

  const head = columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const raw = row[col.key];
            const value = col.format ? col.format(raw, row) : raw;
            return `<td>${escapeHtml(value)}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function flattenProducts(credits = []) {
  const products = [];
  for (const credit of credits) {
    for (const item of credit.items || []) {
      products.push({
        date: credit.date,
        product: item.name,
        qty: item.qty,
        unitPrice: item.price,
        lineTotal: (item.qty || 0) * (item.price || 0),
      });
    }
  }
  return products;
}

export function downloadCustomerReportPdf({
  shopName,
  shopOwner = '',
  customer,
  summary = {},
  ledger = [],
  credits = [],
  payments = [],
}) {
  const products = flattenProducts(credits);
  const linkLabel = customer?.isLinked ? 'Verified / linked' : 'Unverified';

  const profileItems = [
    ['Phone', customer?.phone || '—'],
    ['Email', customer?.email || '—'],
    ['Address', customer?.address || '—'],
    ['Credit score', customer?.creditScore || '—'],
    ['Account link', linkLabel],
    ['Member since', customer?.joined || '—'],
    ['Status', customer?.status || '—'],
  ];

  if (customer?.notes?.trim()) {
    profileItems.push(['Notes', customer.notes.trim()]);
  }

  const creditsHtml = buildTableHtml(credits, [
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Products', key: 'products' },
    { label: 'Total', key: 'total', format: (value) => formatRs(value) },
    { label: 'Note', key: 'note' },
  ]);

  const productsHtml = buildTableHtml(products, [
    { label: 'Date', key: 'date' },
    { label: 'Product', key: 'product' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit price', key: 'unitPrice', format: (value) => formatRs(value) },
    { label: 'Line total', key: 'lineTotal', format: (value) => formatRs(value) },
  ]);

  const paymentsHtml = buildTableHtml(payments, [
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Paid for', key: 'paidFor' },
    { label: 'Amount', key: 'amount', format: (value) => formatRs(value) },
    { label: 'Method', key: 'method' },
    { label: 'Receipt', key: 'receiptNo' },
  ]);

  const ledgerHtml = buildTableHtml(ledger, [
    { label: 'Date', key: 'date' },
    { label: 'Type', key: 'type' },
    {
      label: 'Description',
      key: 'desc',
      format: (_, row) => row.desc || row.items || row.products || '—',
    },
    { label: 'Amount', key: 'amount' },
    { label: 'Balance', key: 'balance' },
  ]);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(customer?.name || 'Customer')} — Full Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 32px; font-size: 13px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 24px 0 8px; page-break-after: avoid; }
    .meta { color: #555; margin-bottom: 24px; font-size: 12px; line-height: 1.6; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
    .stat { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
    .stat span { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
    .stat strong { font-size: 16px; }
    .profile { margin-bottom: 8px; }
    .profile p { margin: 0 0 6px; font-size: 12px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f3f0; font-size: 11px; text-transform: uppercase; }
    .empty { color: #666; font-style: italic; }
    .footer { margin-top: 24px; font-size: 11px; color: #777; }
    @media print { body { margin: 16px; } tr { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>Customer Report — ${escapeHtml(customer?.name || 'Customer')}</h1>
  <div class="meta">
    <div><strong>${escapeHtml(shopName || 'Shop')}</strong>${shopOwner ? ` · ${escapeHtml(shopOwner)}` : ''}</div>
    <div>Generated: ${formatReportDate(new Date().toISOString())}</div>
    <div>Full account history for this customer</div>
  </div>
  <div class="stats">
    <div class="stat"><span>Outstanding due</span><strong>${escapeHtml(formatRs(summary.balance ?? customer?.balance))}</strong></div>
    <div class="stat"><span>Total credit given</span><strong>${escapeHtml(formatRs(summary.totalCredit))}</strong></div>
    <div class="stat"><span>Total paid</span><strong>${escapeHtml(formatRs(summary.totalPaid))}</strong></div>
    <div class="stat"><span>Credit transactions</span><strong>${escapeHtml(String(summary.transactionCount ?? credits.length))}</strong></div>
    <div class="stat"><span>Payments</span><strong>${escapeHtml(String(summary.paymentCount ?? payments.length))}</strong></div>
    <div class="stat"><span>Credit score</span><strong>${escapeHtml(customer?.creditScore || '—')}</strong></div>
  </div>
  <h2>Profile</h2>
  <div class="profile">
    ${profileItems.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}
  </div>
  <h2>Credit transactions</h2>
  ${creditsHtml}
  <h2>Products purchased on credit</h2>
  ${productsHtml}
  <h2>Payments received</h2>
  ${paymentsHtml}
  <h2>Account ledger</h2>
  ${ledgerHtml}
  <div class="footer">BakiBook customer report</div>
</body>
</html>`;

  printHtmlDocument(html);
}
