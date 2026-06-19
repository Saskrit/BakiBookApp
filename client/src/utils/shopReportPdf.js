import { formatRs } from './format';

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
    return '<p class="empty">No records for this report.</p>';
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

function buildSummaryItems(report, type) {
  if (type === 'outstanding') {
    return [
      ['Customers with dues', String(report?.customerCount ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  if (type === 'credits') {
    return [
      ['Credit given', formatRs(report?.creditGiven)],
      ['Credit transactions', String(report?.transactionCount ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  if (type === 'payments') {
    return [
      ['Payments received', formatRs(report?.paymentsReceived)],
      ['Payment records', String(report?.paymentCount ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  if (type === 'products') {
    return [
      ['Product line items', String(report?.productCount ?? 0)],
      ['Total product value', formatRs(report?.productValue)],
    ];
  }

  if (type === 'activity') {
    return [
      ['Credit given', formatRs(report?.creditGiven)],
      ['Payments received', formatRs(report?.paymentsReceived)],
      ['Credit transactions', String(report?.transactionCount ?? 0)],
      ['Payment records', String(report?.paymentCount ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  if (type === 'customers') {
    return [
      ['Total customers', String(report?.customerCount ?? 0)],
      ['Customers with dues', String(report?.customersWithDues ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  if (type === 'complete') {
    return [
      ['Credit given', formatRs(report?.creditGiven)],
      ['Payments received', formatRs(report?.paymentsReceived)],
      ['Credit transactions', String(report?.transactionCount ?? 0)],
      ['Payment records', String(report?.paymentCount ?? 0)],
      ['Product line items', String(report?.productCount ?? 0)],
      ['Customers', String(report?.customerCount ?? 0)],
      ['Total outstanding', formatRs(report?.totalOutstanding)],
    ];
  }

  return [
    ['Credit given', formatRs(report?.creditGiven)],
    ['Payments received', formatRs(report?.paymentsReceived)],
    ['Transactions', String(report?.transactionCount ?? 0)],
    ['Total outstanding', formatRs(report?.totalOutstanding)],
  ];
}

function buildDetailHtml(type, data) {
  const {
    customers = [],
    credits = [],
    payments = [],
    products = [],
    activity = [],
    outstanding = [],
  } = data;

  if (type === 'outstanding') {
    return buildTableHtml(customers, [
      { label: 'Customer', key: 'name' },
      { label: 'Phone', key: 'phone' },
      { label: 'Credit score', key: 'creditScore' },
      { label: 'Balance due', key: 'balance', format: (value) => formatRs(value) },
    ]);
  }

  if (type === 'customer') {
    return buildTableHtml(customers, [
      { label: 'Customer', key: 'name' },
      { label: 'Credit', key: 'credit', format: (value) => formatRs(value) },
      { label: 'Payments', key: 'payments', format: (value) => formatRs(value) },
      { label: 'Current balance', key: 'balance', format: (value) => formatRs(value) },
    ]);
  }

  if (type === 'credits') {
    return buildTableHtml(credits, [
      { label: 'Date', key: 'date' },
      { label: 'Time', key: 'time' },
      { label: 'Customer', key: 'customer' },
      { label: 'Products', key: 'products' },
      { label: 'Total', key: 'total', format: (value) => formatRs(value) },
      { label: 'Note', key: 'note' },
    ]);
  }

  if (type === 'payments') {
    return buildTableHtml(payments, [
      { label: 'Date', key: 'date' },
      { label: 'Time', key: 'time' },
      { label: 'Customer', key: 'customer' },
      { label: 'Paid for', key: 'paidFor' },
      { label: 'Amount', key: 'amount', format: (value) => formatRs(value) },
      { label: 'Method', key: 'method' },
      { label: 'Receipt', key: 'receipt' },
    ]);
  }

  if (type === 'products') {
    return buildTableHtml(products, [
      { label: 'Date', key: 'date' },
      { label: 'Customer', key: 'customer' },
      { label: 'Product', key: 'product' },
      { label: 'Qty', key: 'qty' },
      { label: 'Unit price', key: 'unitPrice', format: (value) => formatRs(value) },
      { label: 'Line total', key: 'lineTotal', format: (value) => formatRs(value) },
    ]);
  }

  if (type === 'activity') {
    return buildTableHtml(activity, [
      { label: 'Date & time', key: 'date' },
      { label: 'Type', key: 'type' },
      { label: 'Customer', key: 'customer' },
      { label: 'Product / paid for', key: 'detail' },
      { label: 'Amount', key: 'amount', format: (value) => formatRs(value) },
      { label: 'Reference', key: 'reference' },
    ]);
  }

  if (type === 'customers') {
    return buildTableHtml(customers, [
      { label: 'Customer', key: 'name' },
      { label: 'Phone', key: 'phone' },
      { label: 'Credit score', key: 'creditScore' },
      { label: 'Balance', key: 'balance', format: (value) => formatRs(value) },
      { label: 'Status', key: 'status' },
    ]);
  }

  if (type === 'complete') {
    return [
      { title: 'Credits & products sold', html: buildDetailHtml('credits', { credits }) },
      { title: 'Payments received', html: buildDetailHtml('payments', { payments }) },
      { title: 'Product line items', html: buildDetailHtml('products', { products }) },
      { title: 'All activity', html: buildDetailHtml('activity', { activity }) },
      { title: 'Customer directory', html: buildDetailHtml('customers', { customers }) },
      { title: 'Outstanding dues', html: buildDetailHtml('outstanding', { customers: outstanding }) },
    ];
  }

  return '';
}

export function printHtmlDocument(html) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Report print preview');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const printWindow = iframe.contentWindow;
  if (!printWindow) {
    iframe.remove();
    throw new Error('Could not open print preview. Please try again.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 1000);
  };

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
    cleanup();
  };

  setTimeout(triggerPrint, 300);
}

export function downloadShopReportPdf({
  shopName,
  reportTitle,
  periodLabel,
  report,
  type = 'summary',
  customers = [],
  credits = [],
  payments = [],
  products = [],
  activity = [],
  outstanding = [],
}) {
  const summaryItems = buildSummaryItems(report, type);
  const detailResult = buildDetailHtml(type, {
    customers,
    credits,
    payments,
    products,
    activity,
    outstanding,
  });

  const periodRange =
    report?.periodStart && report?.periodEnd
      ? `${formatReportDate(report.periodStart)} – ${formatReportDate(report.periodEnd)}`
      : periodLabel;

  let detailHtml = '';
  if (type === 'complete' && Array.isArray(detailResult)) {
    detailHtml = detailResult
      .map((section) => `<h2>${escapeHtml(section.title)}</h2>${section.html}`)
      .join('');
  } else if (detailResult) {
    detailHtml = `<h2>Details</h2>${detailResult}`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reportTitle)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 32px; font-size: 13px; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    h2 { font-size: 14px; margin: 24px 0 8px; page-break-after: avoid; }
    .meta { color: #555; margin-bottom: 24px; font-size: 12px; line-height: 1.6; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 8px; }
    .stat { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
    .stat span { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
    .stat strong { font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f3f0; font-size: 11px; text-transform: uppercase; }
    .empty { color: #666; font-style: italic; }
    .footer { margin-top: 24px; font-size: 11px; color: #777; }
    @media print { body { margin: 16px; } h2 { page-break-before: auto; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(reportTitle)}</h1>
  <div class="meta">
    <div><strong>${escapeHtml(shopName || 'Shop')}</strong></div>
    <div>Period: ${escapeHtml(periodRange)}</div>
    <div>Generated: ${formatReportDate(new Date().toISOString())}</div>
  </div>
  <div class="stats">
    ${summaryItems
      .map(
        ([label, value]) =>
          `<div class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
      )
      .join('')}
  </div>
  ${detailHtml}
  <div class="footer">BakiBook shop report</div>
</body>
</html>`;

  printHtmlDocument(html);
}
