import { useState, useCallback, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import DataTable, { ActionLink } from '../../components/app/DataTable';
import Pagination from '../../components/app/Pagination';
import CustomerReportDownloadButton from '../../components/shopkeeper/CustomerReportDownloadButton';
import LedgerEntryActions, { LedgerFilterTabs, LedgerTypeBadge } from '../../components/ledger/LedgerEntryActions';
import NotificationRowMenu from '../../components/notifications/NotificationRowMenu';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { useSocketEvent } from '../../contexts/SocketProvider';
import { fetchCustomers } from '../../services/customers';
import {
  fetchLedger,
  fetchOutstanding,
  fetchOverdue,
  fetchReminders,
  sendReminder,
  fetchNotifications,
  fetchNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/ledger';
import { resolveNotificationLink } from '../../utils/notificationLinks';
import { formatRs, creditScoreClass } from '../../utils/format';
import { PAGE_SIZE } from '../../constants/pagination';
import '../../components/notifications/NotificationRowMenu.css';
import '../../components/ledger/LedgerEntryActions.css';
import '../../components/app/AppPages.css';

export function CustomerLedgerPage() {
  const user = useShopkeeperUser();
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('active');
  const { data: custData } = useApi(() => fetchCustomers({ all: 'true' }), []);
  const customers = custData?.customers || [];
  const { data, loading, error, reload } = useApi(
    () => (customerId ? fetchLedger(customerId, { page, limit: PAGE_SIZE, filter }) : Promise.resolve(null)),
    [customerId, page, filter]
  );

  const customer = data?.customer;
  const ledgerRows = data?.ledger || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  useEffect(() => {
    setPage(1);
  }, [customerId, filter]);

  const ledgerColumns = [
    { key: 'date', label: 'Date', render: (row) => (row.time ? `${row.date} · ${row.time}` : row.date) },
    { key: 'type', label: 'Type', render: (row) => <LedgerTypeBadge entry={row} /> },
    {
      key: 'desc',
      label: 'Description',
      render: (row) => (
        <div>
          <span>{row.desc || row.items || row.products || '—'}</span>
          {row.kind === 'paid' && (
            <span className="ledger-paid-detail">
              Credit {formatRs(row.creditAmount)} · Paid {formatRs(row.paymentAmount)} · {row.method}
            </span>
          )}
        </div>
      ),
    },
    { key: 'amount', label: 'Amount' },
    { key: 'balance', label: 'Balance' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <LedgerEntryActions
          entry={row}
          viewerRole="shopkeeper"
          filter={filter}
          onUpdated={reload}
        />
      ),
    },
  ];

  return (
    <ShopkeeperPage
      user={user}
      activeNav="ledger"
      pageTitle={customer ? `${customer.name} — Ledger` : 'Customer Ledger'}
      pageSubtitle="Running balance and transaction timeline"
      breadcrumbs={[{ label: 'Ledger', to: '/shop/ledger' }, ...(customer ? [{ label: customer.name }] : [])]}
      actions={
        customerId ? (
          <CustomerReportDownloadButton customerId={customerId} shopName={user?.shopName} label="Full report PDF" />
        ) : null
      }
    >
      {!customerId && (
        <div className="app-filter-bar">
          <select defaultValue="" onChange={(e) => e.target.value && navigate(`/shop/ledger/${e.target.value}`)}>
            <option value="">Select customer...</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      {customerId && loading && <LoadingState />}
      {customerId && error && <ErrorState message={error} onRetry={reload} />}
      {customer && (
        <div className="app-grid-3" style={{ marginBottom: 16 }}>
          <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(customer.balance)}</strong></div>
          <div className="app-stat-mini"><span>Credit Score</span><strong><span className={`app-badge ${creditScoreClass(customer.creditScore)}`}>{customer.creditScore}</span></strong></div>
          <div className="app-stat-mini"><span>Status</span><strong>{customer.status}</strong></div>
        </div>
      )}
      {customerId && !loading && !error && (
        <>
          <LedgerFilterTabs filter={filter} onChange={setFilter} viewerRole="shopkeeper" />
          <DataTable columns={ledgerColumns} rows={ledgerRows} emptyMessage="No ledger entries in this view." />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}

export function OutstandingDuesPage() {
  const user = useShopkeeperUser();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(
    () => fetchOutstanding({ page, limit: PAGE_SIZE }),
    [page]
  );
  const summary = data?.summary;
  const dueCustomers = data?.customers || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <ShopkeeperPage user={user} activeNav="ledger" pageTitle="Outstanding Dues" pageSubtitle="Customers with pending balances">
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <div className="app-grid-4" style={{ marginBottom: 16 }}>
            <div className="app-stat-mini"><span>Total Outstanding</span><strong className="danger">{formatRs(summary?.totalOutstanding)}</strong></div>
            <div className="app-stat-mini"><span>Customers with dues</span><strong>{summary?.customersWithDues}</strong></div>
            <div className="app-stat-mini"><span>Avg. due</span><strong>{formatRs(summary?.avgDue)}</strong></div>
            <div className="app-stat-mini"><span>Collected this month</span><strong className="accent">{formatRs(summary?.collectedThisMonth)}</strong></div>
          </div>
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'balance', label: 'Due', render: (r) => formatRs(r.balance) },
              { key: 'creditScore', label: 'Score', render: (r) => <span className={`app-badge ${creditScoreClass(r.creditScore)}`}>{r.creditScore}</span> },
              { key: 'actions', label: '', render: (r) => <ActionLink to={`/shop/ledger/${r.id}`}>Ledger</ActionLink> },
            ]}
            rows={dueCustomers}
          />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}

export function OverdueCustomersPage() {
  const user = useShopkeeperUser();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(
    () => fetchOverdue({ page, limit: PAGE_SIZE }),
    [page]
  );
  const overdue = data?.customers || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <ShopkeeperPage user={user} activeNav="ledger" pageTitle="Overdue Customers" pageSubtitle="Accounts past due thresholds">
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'balance', label: 'Due', render: (r) => formatRs(r.balance) },
              { key: 'creditScore', label: 'Risk', render: (r) => <span className={`app-badge ${creditScoreClass(r.creditScore)}`}>{r.creditScore}</span> },
              { key: 'actions', label: '', render: (r) => <Link to={`/shop/reminders/send?customer=${r.id}`} className="app-link-btn"><Send size={14} /> Remind</Link> },
            ]}
            rows={overdue}
          />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}

export function NotificationsCenterPage() {
  const user = useShopkeeperUser();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useApi(
    () => fetchNotifications({ page, limit: PAGE_SIZE, filter }),
    [page, filter]
  );
  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const refresh = useCallback(() => {
    reload();
    window.dispatchEvent(new CustomEvent('bakibook:notifications-updated'));
  }, [reload]);

  useSocketEvent('notification:new', refresh, [refresh]);
  useSocketEvent('notification:count', refresh, [refresh]);

  const handleFilterChange = (next) => {
    setFilter(next);
    setPage(1);
  };

  const handleOpen = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        refresh();
      } catch {
        /* ignore */
      }
    }
    navigate(resolveNotificationLink(notification));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    refresh();
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="notifications"
      pageTitle="Notifications"
      pageSubtitle={`${pagination.total} alerts`}
      actions={
        filter !== 'archived' ? (
          <button type="button" className="app-btn app-btn--outline app-btn--sm" onClick={handleMarkAllRead}>
            Mark all as read
          </button>
        ) : null
      }
    >
      <div className="notif-center-tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
          { key: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={filter === tab.key ? 'active' : ''}
            onClick={() => handleFilterChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refresh} /> : (
        <>
          <div className="app-notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`app-notif-item notif-center-item ${!n.read && !n.archived ? 'app-notif-item--unread' : ''}`}
              >
                <div className="notif-center-item__main" onClick={() => handleOpen(n)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleOpen(n)}>
                  <div className="app-notif-item__row" style={{ flex: 1 }}>
                    <div className="app-notif-item__content">
                      <strong>{n.title}</strong>
                      <p>{n.body}</p>
                    </div>
                    <time>{n.date}</time>
                  </div>
                </div>
                <NotificationRowMenu notification={n} onUpdated={refresh} />
              </div>
            ))}
            {!notifications.length && <div className="app-empty">No notifications in this view.</div>}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}

export function NotificationDetailPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => fetchNotification(id), [id]);
  const notification = data?.notification;

  useEffect(() => {
    if (notification) {
      navigate(resolveNotificationLink(notification), { replace: true });
    }
  }, [notification, navigate]);

  if (loading) return <ShopkeeperPage user={user} activeNav="notifications"><LoadingState /></ShopkeeperPage>;
  if (error || !notification) {
    return (
      <ShopkeeperPage user={user} activeNav="notifications" pageTitle="Notifications">
        <div className="app-empty">Notification not found.</div>
      </ShopkeeperPage>
    );
  }

  return <ShopkeeperPage user={user} activeNav="notifications"><LoadingState /></ShopkeeperPage>;
}

export function DueRemindersPage() {
  const user = useShopkeeperUser();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(
    () => fetchReminders({ page, limit: PAGE_SIZE }),
    [page]
  );
  const reminders = data?.reminders || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reminders"
      pageTitle="Due Reminders"
      pageSubtitle="Customers needing follow-up"
      actions={
        <Link to="/shop/reminders/send" className="app-btn app-btn--primary app-btn--sm">
          <Send size={16} /> Send Reminder
        </Link>
      }
    >
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <DataTable
            columns={[
              { key: 'name', label: 'Customer' },
              { key: 'amount', label: 'Due', render: (r) => formatRs(r.amount) },
              { key: 'daysOverdue', label: 'Overdue', render: (r) => `${r.daysOverdue} days` },
              { key: 'actions', label: '', render: (r) => <Link to={`/shop/reminders/send?customer=${r.customerId}`} className="app-link-btn">Send</Link> },
            ]}
            rows={reminders}
          />
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}

export function SendReminderPage() {
  const user = useShopkeeperUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: custData } = useApi(() => fetchCustomers({ all: 'true' }), []);
  const customers = (custData?.customers || []).filter((c) => c.balance > 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerId: params.get('customer') || '',
    channel: 'In-app',
    message: 'Namaste, this is a friendly reminder about your outstanding balance at our shop. Please contact us to settle your dues. — BakiBook',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await sendReminder(form);
      navigate('/shop/reminders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="reminders"
      pageTitle="Send Reminder"
      breadcrumbs={[{ label: 'Reminders', to: '/shop/reminders' }, { label: 'Send' }]}
    >
      <div className="app-card">
        {error && <p className="text-danger" style={{ marginBottom: 12 }}>{error}</p>}
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-field">
            <label>Customer</label>
            <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} required>
              <option value="">Select</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="app-field"><label>Channel</label><select value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}><option>SMS</option><option>Email</option><option>In-app</option></select></div>
          <div className="app-field"><label>Message</label><textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></div>
          <button type="submit" className="app-btn app-btn--primary" disabled={saving}><Send size={16} /> {saving ? 'Sending...' : 'Send Reminder'}</button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}
