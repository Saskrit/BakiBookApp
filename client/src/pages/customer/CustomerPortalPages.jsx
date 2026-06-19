import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Wallet } from 'lucide-react';
import CustomerPage, { useCustomerUser } from '../../components/app/CustomerPage';
import PageHeader from '../../components/app/PageHeader';
import ProfileSettingsContent from '../../components/settings/ProfileSettingsContent';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import DataTable from '../../components/app/DataTable';
import SubmitPaymentModal from '../../components/payments/SubmitPaymentModal';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { useSocketEvent } from '../../contexts/SocketProvider';
import {
  fetchPortalDashboard,
  fetchPortalLedger,
  fetchPortalTransactions,
  fetchPortalPayments,
  fetchPortalDues,
  fetchPortalPaymentSubmissions,
} from '../../services/portal';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/ledger';
import { resolveCustomerNotificationLink } from '../../utils/notificationLinks';
import { formatRs } from '../../utils/format';
import LedgerEntryActions, { LedgerFilterTabs, LedgerTypeBadge } from '../../components/ledger/LedgerEntryActions';
import '../../components/payments/SubmitPaymentModal.css';
import '../../components/ledger/LedgerEntryActions.css';
import '../../components/app/AppPages.css';
import '../Profile.css';

const CUSTOMER_PROFILE_SECTIONS = ['account', 'security'];

const ITEM_PAYMENT_STATUS = {
  pending: { label: 'Paid (Pending)', className: 'pay-sub-status--pending' },
  completed: { label: 'Paid (Completed)', className: 'pay-sub-status--accepted' },
};

const TRANSACTION_PAYMENT_STATUS = {
  pending: { label: 'Paid (Pending)', className: 'pay-sub-status--pending' },
  completed: { label: 'Paid (Completed)', className: 'pay-sub-status--accepted' },
  partial_pending: { label: 'Paid (Pending)', className: 'pay-sub-status--pending' },
  partial: { label: 'Partially paid', className: 'pay-sub-status--accepted' },
};

const SUBMISSION_STATUS = {
  pending: { label: 'Paid (Pending)', className: 'pay-sub-status--pending' },
  accepted: { label: 'Paid (Completed)', className: 'pay-sub-status--accepted' },
  rejected: { label: 'Rejected', className: 'pay-sub-status--rejected' },
  reported: { label: 'Reported', className: 'pay-sub-status--reported' },
};

function PaymentStatusBadge({ status, labels = ITEM_PAYMENT_STATUS }) {
  const meta = labels[status];
  if (!meta) return null;
  return <span className={`pay-sub-status ${meta.className}`}>{meta.label}</span>;
}

function CustomerShell({ children, pageTitle, pageSubtitle, activeNav }) {
  const user = useCustomerUser();
  return (
    <CustomerPage user={user} pageTitle={pageTitle} pageSubtitle={pageSubtitle} activeNav={activeNav}>
      {children}
    </CustomerPage>
  );
}

export function CustomerPortalDashboard() {
  const user = useCustomerUser();
  const { data, loading, error, reload } = useApi(() => fetchPortalDashboard(), []);
  const summary = data?.summary;

  return (
    <CustomerShell pageTitle={`Hello, ${user?.fullName?.split(' ')[0]}`} pageSubtitle="Your credit account overview">
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <div className="app-grid-4" style={{ marginBottom: 20 }}>
            <div className="app-stat-mini"><span>Current Due</span><strong className="danger">{formatRs(summary?.currentDue)}</strong></div>
            <div className="app-stat-mini"><span>Total Purchases</span><strong>{formatRs(summary?.totalPurchases)}</strong></div>
            <div className="app-stat-mini"><span>Total Paid</span><strong className="accent">{formatRs(summary?.totalPaid)}</strong></div>
            <div className="app-stat-mini"><span>Last Payment</span><strong>{summary?.lastPayment || '—'}</strong></div>
          </div>
          <div className="app-grid-2">
            <Link to="/portal/ledger" className="app-report-card"><strong>My Ledger</strong><span>View full history</span></Link>
            <Link to="/portal/dues" className="app-report-card"><strong>Due Balance</strong><span>Outstanding amount</span></Link>
          </div>
        </>
      )}
    </CustomerShell>
  );
}

export function MyLedgerPage() {
  const [filter, setFilter] = useState('active');
  const { data, loading, error, reload } = useApi(
    () => fetchPortalLedger({ filter }),
    [filter]
  );

  const ledgerColumns = [
    { key: 'date', label: 'Date', render: (row) => (row.time ? `${row.date} · ${row.time}` : row.date) },
    { key: 'shopName', label: 'Shop' },
    { key: 'type', label: 'Type', render: (row) => <LedgerTypeBadge entry={row} /> },
    {
      key: 'items',
      label: 'Items / Description',
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
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <LedgerEntryActions
          entry={row}
          viewerRole="customer"
          filter={filter}
          onUpdated={reload}
        />
      ),
    },
  ];

  return (
    <CustomerShell pageTitle="My Ledger" activeNav="ledger">
      <PageHeader title="My Ledger" subtitle="Purchases, payments, and paid product entries across your linked shops" />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <LedgerFilterTabs filter={filter} onChange={setFilter} viewerRole="customer" />
          <DataTable
            columns={ledgerColumns}
            rows={data?.ledger || []}
            emptyMessage={filter === 'archived' ? 'No archived paid entries.' : 'No ledger entries yet.'}
          />
        </>
      )}
    </CustomerShell>
  );
}

export function MyTransactionsPage() {
  const { data, loading, error, reload } = useApi(() => fetchPortalTransactions(), []);
  const transactions = data?.transactions || [];
  const [payModal, setPayModal] = useState(null);

  useSocketEvent('payment-submission:updated', () => {
    reload();
  }, [reload]);

  const showTransactionStatus = (tx) =>
    tx.paymentStatus && tx.paymentStatus !== 'unpaid';

  const canPayItem = (tx, item) => {
    if (item.paymentStatus !== 'unpaid') return false;
    if (tx.paymentStatus === 'pending' || tx.paymentStatus === 'completed') return false;
    return true;
  };

  return (
    <CustomerShell pageTitle="My Transactions" activeNav="transactions">
      <PageHeader title="My Transactions" subtitle="Pay for a full transaction or individual items" />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : !transactions.length ? (
        <div className="app-empty">No transactions yet.</div>
      ) : (
        <div className="app-stack">
          {transactions.map((tx) => (
            <div key={tx.id} className="app-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong>{tx.shopName}</strong>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    {tx.date} · {tx.totalFormatted}
                  </p>
                </div>
                {showTransactionStatus(tx) ? (
                  <PaymentStatusBadge status={tx.paymentStatus} labels={TRANSACTION_PAYMENT_STATUS} />
                ) : tx.canPayTransaction ? (
                  <button
                    type="button"
                    className="app-btn app-btn--primary app-btn--sm"
                    onClick={() => setPayModal({
                      customerId: tx.customerId,
                      shopName: tx.shopName,
                      payType: 'transaction',
                      transactionId: tx.id,
                      defaultAmount: tx.total,
                      payLabel: tx.totalFormatted,
                    })}
                  >
                    <Wallet size={14} /> Pay full
                  </button>
                ) : null}
              </div>
              <div className="app-stack" style={{ gap: 8 }}>
                {tx.items.map((item) => (
                  <div key={`${tx.id}-${item.index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--font-sm)' }}>
                      {item.name} × {item.qty} — {formatRs(item.lineTotal)}
                    </span>
                    {item.paymentStatus === 'pending' || item.paymentStatus === 'completed' ? (
                      <PaymentStatusBadge status={item.paymentStatus} />
                    ) : canPayItem(tx, item) ? (
                      <button
                        type="button"
                        className="app-btn app-btn--outline app-btn--sm"
                        onClick={() => setPayModal({
                          customerId: tx.customerId,
                          shopName: tx.shopName,
                          payType: 'item',
                          transactionId: tx.id,
                          itemIndex: item.index,
                          defaultAmount: item.lineTotal,
                          payLabel: item.name,
                        })}
                      >
                        Pay item
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <SubmitPaymentModal
        open={Boolean(payModal)}
        onClose={() => setPayModal(null)}
        onSuccess={reload}
        {...(payModal || {})}
      />
    </CustomerShell>
  );
}

const submissionStatusClass = {
  pending: 'pay-sub-status--pending',
  accepted: 'pay-sub-status--accepted',
  rejected: 'pay-sub-status--rejected',
  reported: 'pay-sub-status--reported',
};

export function MyPaymentsPage() {
  const { data, loading, error, reload } = useApi(() => fetchPortalPayments(), []);
  const { data: subData, loading: subLoading, reload: reloadSubs } = useApi(
    () => fetchPortalPaymentSubmissions(),
    []
  );
  const payments = data?.payments || [];
  const submissions = subData?.submissions || [];

  const refreshAll = () => {
    reload();
    reloadSubs();
  };

  useSocketEvent('payment-submission:updated', () => {
    refreshAll();
  }, [reload, reloadSubs]);

  const submissionPaymentIds = new Set(
    submissions.filter((s) => s.paymentId).map((s) => s.paymentId)
  );
  const shopkeeperPayments = payments.filter((p) => !submissionPaymentIds.has(p.id));

  const rows = [
    ...submissions.map((s) => ({
      id: `sub-${s.id}`,
      date: s.date,
      shopName: s.shopName || 'Shop',
      paidFor: s.payLabel || s.itemName || s.payType,
      amount: formatRs(s.amount),
      status: SUBMISSION_STATUS[s.status]?.label || s.status,
      statusClass: submissionStatusClass[s.status] || '',
      note: s.reviewNote,
    })),
    ...shopkeeperPayments.map((p) => ({
      id: `pay-${p.id}`,
      date: p.date,
      shopName: p.shopName || 'Shop',
      paidFor: p.paidFor || 'General payment',
      amount: p.amount,
      status: 'Paid (Completed)',
      statusClass: 'pay-sub-status--accepted',
      note: '',
    })),
  ].sort((a, b) => 0);

  return (
    <CustomerShell pageTitle="My Payments" activeNav="payments">
      <PageHeader title="My Payments" subtitle="Track submitted payments until the shopkeeper confirms them" />
      {loading || subLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refreshAll} /> : !rows.length ? (
        <div className="app-empty">No payments yet.</div>
      ) : (
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'shopName', label: 'Shop' },
            { key: 'paidFor', label: 'Paid for' },
            { key: 'amount', label: 'Amount' },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <div>
                  <span className={`pay-sub-status ${r.statusClass}`}>{r.status}</span>
                  {r.note && (
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {r.note}
                    </p>
                  )}
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </CustomerShell>
  );
}

export function MyDueBalancePage() {
  const { data, loading, error, reload } = useApi(() => fetchPortalDues(), []);
  const [payModal, setPayModal] = useState(null);

  useSocketEvent('payment-submission:updated', () => {
    reload();
  }, [reload]);

  return (
    <CustomerShell pageTitle="My Due Balance" activeNav="dues">
      <PageHeader title="Outstanding Balance" subtitle="Pay any amount with your payment screenshot" />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <div className="app-card" style={{ textAlign: 'center', padding: 40, marginBottom: 16 }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>Total Due</p>
            <strong style={{ fontSize: '2rem', color: '#c45c5c' }}>{formatRs(data?.currentDue)}</strong>
          </div>

          {(data?.breakdown || []).length ? (
            <div className="app-stack">
              {(data?.breakdown || []).map((item) => (
                <div key={item.customerId} className="app-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>{item.shopName}</strong>
                    <p style={{ color: '#c45c5c', marginTop: 4 }}>{formatRs(item.balance)} due</p>
                  </div>
                  {item.customPaymentStatus === 'pending' ? (
                    <PaymentStatusBadge status="pending" />
                  ) : (
                    <button
                      type="button"
                      className="app-btn app-btn--primary"
                      onClick={() => setPayModal({
                        customerId: item.customerId,
                        shopName: item.shopName,
                        payType: 'custom',
                        defaultAmount: item.balance,
                      })}
                    >
                      <Wallet size={16} /> Pay
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="app-empty">You have no outstanding balance.</div>
          )}
        </>
      )}
      <SubmitPaymentModal
        open={Boolean(payModal)}
        onClose={() => setPayModal(null)}
        onSuccess={reload}
        {...(payModal || {})}
      />
    </CustomerShell>
  );
}

export function MyNotificationsPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(
    () => fetchNotifications({ page: 1, limit: 30, filter: 'all' }),
    []
  );
  const notifications = data?.notifications || [];

  const refresh = () => {
    reload();
    window.dispatchEvent(new CustomEvent('bakibook:notifications-updated'));
  };

  useSocketEvent('notification:new', refresh, [refresh]);

  const handleOpen = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        refresh();
      } catch {
        /* ignore */
      }
    }
    navigate(resolveCustomerNotificationLink(notification));
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      refresh();
    } catch {
      /* ignore */
    }
  };

  return (
    <CustomerShell pageTitle="Notifications" activeNav="notifications">
      <PageHeader
        title="My Notifications"
        subtitle="Shop updates, payments, and messages"
        actions={
          notifications.some((n) => !n.read) ? (
            <button type="button" className="app-btn app-btn--outline" onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          ) : null
        }
      />
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refresh} /> : (
        <div className="app-notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              className={`app-notif-item ${!n.read ? 'app-notif-item--unread' : ''}`}
              onClick={() => handleOpen(n)}
              onKeyDown={(e) => e.key === 'Enter' && handleOpen(n)}
            >
              <div className="app-notif-item__row">
                <div className="app-notif-item__content">
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
                <time>{n.date}</time>
              </div>
            </div>
          ))}
          {!notifications.length && <div className="app-empty">No notifications yet.</div>}
        </div>
      )}
    </CustomerShell>
  );
}

export function MyProfilePage() {
  const settings = useProfileSettings();

  if (!settings.auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CustomerShell
      pageTitle="My Profile"
      pageSubtitle="Account details and security"
      activeNav="profile"
    >
      <PageHeader
        title="My Profile"
        subtitle="Update your name, profile picture, email verification, and password"
      />
      <ProfileSettingsContent
        {...settings}
        embedded
        sections={CUSTOMER_PROFILE_SECTIONS}
      />
    </CustomerShell>
  );
}
