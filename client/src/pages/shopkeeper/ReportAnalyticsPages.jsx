import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Users,
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  ShoppingBag,
  CreditCard,
  Package,
  List,
  Layers,
} from 'lucide-react';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import DataTable from '../../components/app/DataTable';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { fetchReport, fetchAnalytics } from '../../services/shop';
import { formatRs } from '../../utils/format';
import { downloadShopReportPdf } from '../../utils/shopReportPdf';
import '../../components/app/AppPages.css';

const reportLinks = [
  { to: '/shop/reports/daily', icon: Calendar, title: 'Daily Report', desc: 'Today\'s summary' },
  { to: '/shop/reports/weekly', icon: CalendarDays, title: 'Weekly Report', desc: 'Last 7 days' },
  { to: '/shop/reports/monthly', icon: CalendarRange, title: 'Monthly Report', desc: 'This month' },
  { to: '/shop/reports/credits', icon: ShoppingBag, title: 'Credits Report', desc: 'All credit bills & products' },
  { to: '/shop/reports/payments', icon: CreditCard, title: 'Payments Report', desc: 'All payments received' },
  { to: '/shop/reports/products', icon: Package, title: 'Products Report', desc: 'Item-level breakdown' },
  { to: '/shop/reports/activity', icon: List, title: 'Activity Report', desc: 'Credits & payments combined' },
  { to: '/shop/reports/customer', icon: Users, title: 'Customer-wise', desc: 'Per customer breakdown' },
  { to: '/shop/reports/outstanding', icon: FileText, title: 'Outstanding Report', desc: 'All pending dues' },
  { to: '/shop/reports/complete', icon: Layers, title: 'Complete Report', desc: 'Everything in one PDF' },
  { to: '/shop/reports/download', icon: Download, title: 'Download PDF', desc: 'Custom export' },
];

const REPORT_KIND_OPTIONS = [
  { value: 'summary', label: 'Summary' },
  { value: 'credits', label: 'Credits & products sold' },
  { value: 'payments', label: 'Payments received' },
  { value: 'products', label: 'Product line items' },
  { value: 'activity', label: 'Credits & payments activity' },
  { value: 'customer', label: 'Customer-wise breakdown' },
  { value: 'outstanding', label: 'Outstanding dues' },
  { value: 'customers', label: 'Customer directory' },
  { value: 'complete', label: 'Complete report (all sections)' },
];

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 days' },
  { value: 'monthly', label: 'This month' },
];

const PERIOD_LABELS = {
  daily: 'Today',
  weekly: 'Last 7 days',
  monthly: 'This month',
};

const KIND_LABELS = {
  summary: 'Summary',
  credits: 'Credits',
  payments: 'Payments',
  products: 'Products',
  activity: 'Activity',
  customer: 'Customer-wise',
  outstanding: 'Outstanding',
  customers: 'Customers',
  complete: 'Complete',
};

const DATE_INDEPENDENT_KINDS = new Set(['outstanding', 'customers']);

async function exportReportPdf({ user, title, periodLabel, periodKey, reportType, from, to }) {
  const period = DATE_INDEPENDENT_KINDS.has(reportType) ? 'monthly' : periodKey;

  const payload = await fetchReport({
    period,
    type: reportType,
    from: from || undefined,
    to: to || undefined,
  });

  downloadShopReportPdf({
    shopName: user?.shopName || user?.fullName || 'Shop',
    reportTitle: title,
    periodLabel,
    report: payload?.report,
    type: payload?.type || reportType,
    customers: payload?.customers || [],
    credits: payload?.credits || [],
    payments: payload?.payments || [],
    products: payload?.products || [],
    activity: payload?.activity || [],
    outstanding: payload?.outstanding || [],
  });
}

function ReportStats({ reportType, report }) {
  if (reportType === 'outstanding') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Customers with dues</span><strong>{report?.customerCount}</strong></div>
        <div className="app-stat-mini"><span>Total outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
      </div>
    );
  }

  if (reportType === 'credits') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Credit given</span><strong>{formatRs(report?.creditGiven)}</strong></div>
        <div className="app-stat-mini"><span>Transactions</span><strong>{report?.transactionCount}</strong></div>
        <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
      </div>
    );
  }

  if (reportType === 'payments') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Payments received</span><strong>{formatRs(report?.paymentsReceived)}</strong></div>
        <div className="app-stat-mini"><span>Payment records</span><strong>{report?.paymentCount}</strong></div>
        <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
      </div>
    );
  }

  if (reportType === 'products') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Line items</span><strong>{report?.productCount}</strong></div>
        <div className="app-stat-mini"><span>Total value</span><strong>{formatRs(report?.productValue)}</strong></div>
      </div>
    );
  }

  if (reportType === 'activity') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Credit given</span><strong>{formatRs(report?.creditGiven)}</strong></div>
        <div className="app-stat-mini"><span>Payments</span><strong>{formatRs(report?.paymentsReceived)}</strong></div>
        <div className="app-stat-mini"><span>Credit txs</span><strong>{report?.transactionCount}</strong></div>
        <div className="app-stat-mini"><span>Payment records</span><strong>{report?.paymentCount}</strong></div>
      </div>
    );
  }

  if (reportType === 'customers') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Total customers</span><strong>{report?.customerCount}</strong></div>
        <div className="app-stat-mini"><span>With dues</span><strong>{report?.customersWithDues}</strong></div>
        <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
      </div>
    );
  }

  if (reportType === 'complete') {
    return (
      <div className="app-grid-4" style={{ marginBottom: 16 }}>
        <div className="app-stat-mini"><span>Credit given</span><strong>{formatRs(report?.creditGiven)}</strong></div>
        <div className="app-stat-mini"><span>Payments</span><strong>{formatRs(report?.paymentsReceived)}</strong></div>
        <div className="app-stat-mini"><span>Products</span><strong>{report?.productCount}</strong></div>
        <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
      </div>
    );
  }

  return (
    <div className="app-grid-4" style={{ marginBottom: 16 }}>
      <div className="app-stat-mini"><span>Credit Given</span><strong>{formatRs(report?.creditGiven)}</strong></div>
      <div className="app-stat-mini"><span>Payments</span><strong>{formatRs(report?.paymentsReceived)}</strong></div>
      <div className="app-stat-mini"><span>Transactions</span><strong>{report?.transactionCount}</strong></div>
      <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(report?.totalOutstanding)}</strong></div>
    </div>
  );
}

function ReportDetailTable({ reportType, data }) {
  if (reportType === 'customer' && data.customers?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Customer breakdown</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Customer' },
            { key: 'credit', label: 'Credit', render: (r) => formatRs(r.credit) },
            { key: 'payments', label: 'Payments', render: (r) => formatRs(r.payments) },
            { key: 'balance', label: 'Balance', render: (r) => formatRs(r.balance) },
          ]}
          rows={data.customers.map((row, idx) => ({ ...row, id: `${row.name}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'outstanding' && data.customers?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Outstanding balances</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Customer' },
            { key: 'phone', label: 'Phone' },
            { key: 'creditScore', label: 'Score' },
            { key: 'balance', label: 'Due', render: (r) => formatRs(r.balance) },
          ]}
          rows={data.customers.map((row, idx) => ({ ...row, id: `${row.name}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'credits' && data.credits?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Credit transactions</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'customer', label: 'Customer' },
            { key: 'products', label: 'Products' },
            { key: 'total', label: 'Total', render: (r) => formatRs(r.total) },
          ]}
          rows={data.credits.map((row, idx) => ({ ...row, id: `${row.date}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'payments' && data.payments?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Payments</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'customer', label: 'Customer' },
            { key: 'paidFor', label: 'Paid for' },
            { key: 'amount', label: 'Amount', render: (r) => formatRs(r.amount) },
            { key: 'method', label: 'Method' },
          ]}
          rows={data.payments.map((row, idx) => ({ ...row, id: `${row.receipt}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'products' && data.products?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Product line items</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'customer', label: 'Customer' },
            { key: 'product', label: 'Product' },
            { key: 'qty', label: 'Qty' },
            { key: 'lineTotal', label: 'Total', render: (r) => formatRs(r.lineTotal) },
          ]}
          rows={data.products.map((row, idx) => ({ ...row, id: `${row.product}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'activity' && data.activity?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">Activity</h3>
        <DataTable
          columns={[
            { key: 'date', label: 'Date & time' },
            { key: 'type', label: 'Type' },
            { key: 'customer', label: 'Customer' },
            { key: 'detail', label: 'Product / paid for' },
            { key: 'amount', label: 'Amount', render: (r) => formatRs(r.amount) },
          ]}
          rows={data.activity.map((row, idx) => ({ ...row, id: `${row.date}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'customers' && data.customers?.length) {
    return (
      <div className="app-card" style={{ marginBottom: 16 }}>
        <h3 className="app-card__title">All customers</h3>
        <DataTable
          columns={[
            { key: 'name', label: 'Customer' },
            { key: 'phone', label: 'Phone' },
            { key: 'creditScore', label: 'Score' },
            { key: 'balance', label: 'Balance', render: (r) => formatRs(r.balance) },
          ]}
          rows={data.customers.map((row, idx) => ({ ...row, id: `${row.name}-${idx}` }))}
        />
      </div>
    );
  }

  if (reportType === 'complete') {
    return (
      <>
        <ReportDetailTable reportType="credits" data={data} />
        <ReportDetailTable reportType="payments" data={data} />
        <ReportDetailTable reportType="products" data={data} />
        <ReportDetailTable reportType="activity" data={data} />
        <ReportDetailTable reportType="customers" data={data} />
        {data.outstanding?.length > 0 && (
          <div className="app-card" style={{ marginBottom: 16 }}>
            <h3 className="app-card__title">Outstanding dues</h3>
            <DataTable
              columns={[
                { key: 'name', label: 'Customer' },
                { key: 'balance', label: 'Due', render: (r) => formatRs(r.balance) },
              ]}
              rows={data.outstanding.map((row, idx) => ({ ...row, id: `${row.name}-${idx}` }))}
            />
          </div>
        )}
      </>
    );
  }

  return null;
}

function ReportTemplate({ title, periodKey, periodLabel, reportType = 'summary' }) {
  const user = useShopkeeperUser();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const { data, loading, error, reload } = useApi(
    () => fetchReport({ period: periodKey, type: reportType }),
    [periodKey, reportType]
  );
  const report = data?.report;

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      await exportReportPdf({
        user,
        title,
        periodLabel,
        periodKey,
        reportType,
      });
    } catch (err) {
      setExportError(err.message || 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reports"
      pageTitle={title}
      pageSubtitle={periodLabel}
      breadcrumbs={[{ label: 'Reports', to: '/shop/reports' }, { label: title }]}
      actions={
        <button type="button" className="app-btn app-btn--outline app-btn--sm" onClick={handleExport} disabled={exporting || loading}>
          <Download size={16} /> {exporting ? 'Generating…' : 'Export PDF'}
        </button>
      }
    >
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <ReportStats reportType={reportType} report={report} />
          <ReportDetailTable reportType={reportType} data={data || {}} />
          <div className="app-card">
            <p>Report period: <strong>{periodLabel}</strong>. Live data from your shop records.</p>
            {exportError && <p className="app-form-error" style={{ marginTop: 12 }}>{exportError}</p>}
          </div>
        </>
      )}
    </ShopkeeperPage>
  );
}

export function ReportsDashboardPage() {
  const user = useShopkeeperUser();
  return (
    <ShopkeeperPage user={user} activeNav="reports" pageTitle="Reports" pageSubtitle="Generate and export shop reports">
      <div className="app-report-grid">
        {reportLinks.map((r) => (
          <Link key={r.to} to={r.to} className="app-report-card"><r.icon size={24} /><strong>{r.title}</strong><span>{r.desc}</span></Link>
        ))}
      </div>
    </ShopkeeperPage>
  );
}

export const DailyReportPage = () => <ReportTemplate title="Daily Report" periodKey="daily" periodLabel="Today" />;
export const WeeklyReportPage = () => <ReportTemplate title="Weekly Report" periodKey="weekly" periodLabel="Last 7 days" />;
export const MonthlyReportPage = () => <ReportTemplate title="Monthly Report" periodKey="monthly" periodLabel="This month" />;
export const CreditsReportPage = () => (
  <ReportTemplate title="Credits Report" periodKey="monthly" periodLabel="This month" reportType="credits" />
);
export const PaymentsReportPage = () => (
  <ReportTemplate title="Payments Report" periodKey="monthly" periodLabel="This month" reportType="payments" />
);
export const ProductsReportPage = () => (
  <ReportTemplate title="Products Report" periodKey="monthly" periodLabel="This month" reportType="products" />
);
export const ActivityReportPage = () => (
  <ReportTemplate title="Activity Report" periodKey="monthly" periodLabel="This month" reportType="activity" />
);
export const CustomerReportPage = () => (
  <ReportTemplate title="Customer-wise Report" periodKey="monthly" periodLabel="This month" reportType="customer" />
);
export const OutstandingReportPage = () => (
  <ReportTemplate title="Outstanding Report" periodKey="monthly" periodLabel="Current dues" reportType="outstanding" />
);
export const CompleteReportPage = () => (
  <ReportTemplate title="Complete Report" periodKey="monthly" periodLabel="This month" reportType="complete" />
);

export function DownloadReportPage() {
  const user = useShopkeeperUser();
  const [reportKind, setReportKind] = useState('complete');
  const [period, setPeriod] = useState('monthly');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const showPeriod = !DATE_INDEPENDENT_KINDS.has(reportKind);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setExporting(true);
    setExportError('');

    try {
      if (from && to && new Date(from) > new Date(to)) {
        throw new Error('"From" date must be before "To" date.');
      }

      const periodLabel = from && to
        ? `${from} to ${to}`
        : showPeriod
          ? PERIOD_LABELS[period]
          : 'Current snapshot';

      await exportReportPdf({
        user,
        title: `${KIND_LABELS[reportKind]} Report`,
        periodLabel,
        periodKey: period,
        reportType: reportKind,
        from: from || undefined,
        to: to || undefined,
      });
    } catch (err) {
      setExportError(err.message || 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reports"
      pageTitle="Download PDF Report"
      breadcrumbs={[{ label: 'Reports', to: '/shop/reports' }, { label: 'Download' }]}
    >
      <div className="app-card">
        <form className="app-form" onSubmit={handleGenerate}>
          <div className="app-field">
            <label htmlFor="report-kind">Report type</label>
            <select id="report-kind" value={reportKind} onChange={(e) => setReportKind(e.target.value)}>
              {REPORT_KIND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {showPeriod && (
            <div className="app-field">
              <label htmlFor="report-period">Period</label>
              <select id="report-period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
          <div className="app-grid-2">
            <div className="app-field">
              <label htmlFor="report-from">From (optional)</label>
              <input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="app-field">
              <label htmlFor="report-to">To (optional)</label>
              <input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            Export credits, payments, products, activity, customers, or a complete report with all sections.
            The print dialog will open — choose &quot;Save as PDF&quot; as the destination to download.
          </p>
          {exportError && <p className="app-form-error">{exportError}</p>}
          <button type="submit" className="app-btn app-btn--primary" disabled={exporting}>
            <Download size={16} /> {exporting ? 'Generating…' : 'Generate PDF'}
          </button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}

export function AnalyticsDashboardPage() {
  const user = useShopkeeperUser();
  const links = [
    { to: '/shop/analytics/credit', icon: TrendingUp, title: 'Credit Trends', desc: 'Credit over time' },
    { to: '/shop/analytics/payments', icon: BarChart3, title: 'Payment Trends', desc: 'Collections trend' },
    { to: '/shop/analytics/customers', icon: PieChart, title: 'Customer Performance', desc: 'Top debtors & scores' },
  ];

  return (
    <ShopkeeperPage user={user} activeNav="reports" pageTitle="Analytics" pageSubtitle="Insights for your shop">
      <div className="app-report-grid">{links.map((l) => <Link key={l.to} to={l.to} className="app-report-card"><l.icon size={24} /><strong>{l.title}</strong><span>{l.desc}</span></Link>)}</div>
    </ShopkeeperPage>
  );
}

function AnalyticsCreditPage() {
  const user = useShopkeeperUser();
  const { data, loading, error, reload } = useApi(() => fetchAnalytics(), []);
  const analytics = data?.analytics;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reports"
      pageTitle="Credit Trends"
      breadcrumbs={[{ label: 'Analytics', to: '/shop/analytics' }, { label: 'Credit Trends' }]}
    >
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="app-card">
          <h3 className="app-card__title">Credit Given (Last 6 Months)</h3>
          {(analytics?.creditByMonth || []).length ? (
            <ul style={{ marginTop: 12 }}>
              {analytics.creditByMonth.map((row) => (
                <li key={row._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{row._id}</span>
                  <strong>{formatRs(row.total)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-empty">No credit data for this period.</p>
          )}
        </div>
      )}
    </ShopkeeperPage>
  );
}

function AnalyticsPaymentPage() {
  const user = useShopkeeperUser();
  const { data, loading, error, reload } = useApi(() => fetchAnalytics(), []);
  const analytics = data?.analytics;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reports"
      pageTitle="Payment Trends"
      breadcrumbs={[{ label: 'Analytics', to: '/shop/analytics' }, { label: 'Payment Trends' }]}
    >
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="app-card">
          <h3 className="app-card__title">Payments Received (Last 6 Months)</h3>
          {(analytics?.paymentByMonth || []).length ? (
            <ul style={{ marginTop: 12 }}>
              {analytics.paymentByMonth.map((row) => (
                <li key={row._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{row._id}</span>
                  <strong>{formatRs(row.total)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-empty">No payment data for this period.</p>
          )}
        </div>
      )}
    </ShopkeeperPage>
  );
}

function AnalyticsCustomersPage() {
  const user = useShopkeeperUser();
  const { data, loading, error, reload } = useApi(() => fetchAnalytics(), []);
  const analytics = data?.analytics;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reports"
      pageTitle="Customer Performance"
      breadcrumbs={[{ label: 'Analytics', to: '/shop/analytics' }, { label: 'Customer Performance' }]}
    >
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="app-card">
          <h3 className="app-card__title">Top Customers by Balance</h3>
          {(analytics?.topCustomers || []).length ? (
            <ul style={{ marginTop: 12 }}>
              {analytics.topCustomers.map((c) => (
                <li key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{c.name} <small className={`app-badge ${c.creditScore === 'Defaulter' || c.creditScore === 'Risky' ? 'app-badge--danger' : 'app-badge--info'}`}>{c.creditScore}</small></span>
                  <strong>{formatRs(c.balance)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-empty">No customer balances yet.</p>
          )}
        </div>
      )}
    </ShopkeeperPage>
  );
}

export const CreditTrendsPage = () => <AnalyticsCreditPage />;
export const PaymentTrendsPage = () => <AnalyticsPaymentPage />;
export const CustomerPerformancePage = () => <AnalyticsCustomersPage />;
