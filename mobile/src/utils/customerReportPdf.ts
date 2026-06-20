import type { Customer } from '../types';
import {
  PDF_STYLES,
  buildTableHtml,
  escapeHtml,
  formatReportDate,
  formatRs,
  shareHtmlAsPdf,
} from './pdfHtml';

type CustomerReportData = {
  shopName?: string;
  shopOwner?: string;
  customer: Customer;
  summary: {
    balance?: number;
    totalCredit?: number;
    totalPaid?: number;
    transactionCount?: number;
    paymentCount?: number;
  };
  ledger: Array<Record<string, unknown>>;
  credits: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
};

function flattenProducts(credits: Array<Record<string, unknown>>) {
  const products: Array<Record<string, unknown>> = [];
  for (const credit of credits) {
    const items = (credit.items as Array<{ name: string; qty: number; price: number }>) || [];
    for (const item of items) {
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

export async function exportCustomerReportPdf(data: CustomerReportData) {
  const { customer, summary, ledger, credits, payments, shopName, shopOwner } = data;
  const products = flattenProducts(credits);
  const linkLabel = customer.linkStatus === 'linked' ? 'Linked account' : 'Not linked';

  const profileItems: [string, string][] = [
    ['Phone', customer.phone || '—'],
    ['Email', customer.email || '—'],
    ['Address', customer.address || '—'],
    ['Credit score', customer.creditScore || '—'],
    ['Account link', linkLabel],
    ['Status', customer.status || '—'],
  ];
  if (customer.notes?.trim()) {
    profileItems.push(['Notes', customer.notes.trim()]);
  }

  const statsHtml = [
    ['Outstanding due', formatRs(summary.balance ?? customer.balance)],
    ['Total credit given', formatRs(summary.totalCredit ?? 0)],
    ['Total paid', formatRs(summary.totalPaid ?? 0)],
    ['Credit transactions', String(summary.transactionCount ?? credits.length)],
    ['Payments', String(summary.paymentCount ?? payments.length)],
  ]
    .map(([label, value]) => `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join('');

  const profileHtml = profileItems
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
    .join('');

  const creditsHtml = buildTableHtml(credits, [
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Products', key: 'products' },
    { label: 'Total', key: 'total', format: (v) => formatRs(Number(v)) },
    { label: 'Note', key: 'note' },
  ]);

  const productsHtml = buildTableHtml(products, [
    { label: 'Date', key: 'date' },
    { label: 'Product', key: 'product' },
    { label: 'Qty', key: 'qty' },
    { label: 'Unit price', key: 'unitPrice', format: (v) => formatRs(Number(v)) },
    { label: 'Line total', key: 'lineTotal', format: (v) => formatRs(Number(v)) },
  ]);

  const paymentsHtml = buildTableHtml(payments, [
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Paid for', key: 'paidFor' },
    { label: 'Amount', key: 'amount', format: (v) => formatRs(Number(v)) },
    { label: 'Method', key: 'method' },
    { label: 'Receipt', key: 'receiptNo' },
  ]);

  const ledgerHtml = buildTableHtml(ledger, [
    { label: 'Date', key: 'date' },
    { label: 'Time', key: 'time' },
    { label: 'Type', key: 'type' },
    {
      label: 'Description',
      key: 'desc',
      format: (_, row) => String(row.desc || row.items || row.products || '—'),
    },
    { label: 'Amount', key: 'amount' },
    { label: 'Balance', key: 'balance' },
  ]);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>${PDF_STYLES}</style></head><body>
    <h1>Customer report — ${escapeHtml(customer.name)}</h1>
    <div class="meta">
      <div><strong>${escapeHtml(shopName || 'Shop')}</strong>${shopOwner ? ` · ${escapeHtml(shopOwner)}` : ''}</div>
      <div>Generated: ${formatReportDate(new Date().toISOString())}</div>
    </div>
    <h2>Summary</h2><div class="stats">${statsHtml}</div>
    <h2>Profile</h2><div class="profile">${profileHtml}</div>
    <h2>Credit transactions</h2>${creditsHtml}
    <h2>Products purchased</h2>${productsHtml}
    <h2>Payments</h2>${paymentsHtml}
    <h2>Account ledger</h2>${ledgerHtml}
    <div class="footer">BakiBook customer report</div>
  </body></html>`;

  await shareHtmlAsPdf(html, 'Export customer report');
}
