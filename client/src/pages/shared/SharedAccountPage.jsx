import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { getAuth, getPostAuthPath, canAccessCustomer } from '../../services/auth';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import CustomerPage from '../../components/app/CustomerPage';
import PageHeader from '../../components/app/PageHeader';
import DataTable from '../../components/app/DataTable';
import Pagination from '../../components/app/Pagination';
import CustomerReportDownloadButton from '../../components/shopkeeper/CustomerReportDownloadButton';
import LedgerEntryActions, { LedgerFilterTabs, LedgerTypeBadge } from '../../components/ledger/LedgerEntryActions';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { useClientPagination } from '../../hooks/useClientPagination';
import { fetchSharedCredits } from '../../services/shared';
import { formatRs } from '../../utils/format';
import '../../components/app/AppPages.css';
import '../../components/ledger/LedgerEntryActions.css';
import './SharedAccountPage.css';

function SharedAccountContent({ backLink, backLabel, hideHeader = false, viewerRole = 'shopkeeper' }) {
  const { customerId, id } = useParams();
  const recordId = customerId || id;
  const [filter, setFilter] = useState('active');
  const { data, loading, error, reload } = useApi(
    () => fetchSharedCredits(recordId, { filter }),
    [recordId, filter]
  );
  const { items: ledgerPage, page, totalPages, total, setPage } = useClientPagination(data?.ledger || []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { customer, shop, summary } = data;

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
          viewerRole={viewerRole}
          filter={filter}
          onUpdated={reload}
        />
      ),
    },
  ];

  return (
    <>
      {!hideHeader && (
        <PageHeader
          title={`${customer.name} — Credit Account`}
          subtitle={shop?.name ? `${shop.name} · ${shop.owner}` : ''}
          breadcrumbs={[
            { label: backLabel, to: backLink },
            { label: customer.name },
          ]}
          actions={
            <Link to={backLink} className="app-btn app-btn--outline">
              <ArrowLeft size={16} /> Back
            </Link>
          }
        />
      )}

      <div className="shared-account-grid shared-account-grid--single">
        <div className="shared-account-main">
          <div className="app-grid-4" style={{ marginBottom: 16 }}>
            <div className="app-stat-mini"><span>Outstanding</span><strong className="danger">{formatRs(summary.balance)}</strong></div>
            <div className="app-stat-mini"><span>Total Credit</span><strong>{formatRs(summary.totalCredit)}</strong></div>
            <div className="app-stat-mini"><span>Total Paid</span><strong className="accent">{formatRs(summary.totalPaid)}</strong></div>
            <div className="app-stat-mini"><span>Status</span><strong><span className={`app-badge ${customer.isLinked ? 'app-badge--success' : 'app-badge--warn'}`}>{customer.isLinked ? 'Linked' : 'Unverified'}</span></strong></div>
          </div>

          <div className="app-card">
            <h3 className="app-card__title">Credit Ledger</h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              {viewerRole === 'customer'
                ? 'Paid product entries combine credit and payment in one row. Archive hides them from your view only.'
                : 'Paid product entries combine credit and payment in one row. Removing hides them from your shop view only.'}
            </p>
            <LedgerFilterTabs filter={filter} onChange={setFilter} viewerRole={viewerRole} />
            <DataTable columns={ledgerColumns} rows={ledgerPage} emptyMessage={filter === 'archived' ? 'No archived paid entries.' : 'No ledger entries yet.'} />
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </>
  );
}

export function ShopkeeperSharedAccountPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="customers"
      pageTitle="Credit Account"
      pageSubtitle="Shared ledger with customer"
      breadcrumbs={[{ label: 'Customers', to: '/shop/customers' }, { label: 'Account' }]}
      actions={
        <>
          <CustomerReportDownloadButton customerId={id} shopName={user?.shopName} label="Full report PDF" />
          <Link to="/shop/customers" className="app-btn app-btn--outline app-btn--sm">
            <ArrowLeft size={16} /> Back
          </Link>
        </>
      }
    >
      <SharedAccountContent backLink="/shop/customers" backLabel="Customers" hideHeader viewerRole="shopkeeper" />
    </ShopkeeperPage>
  );
}

export function CustomerSharedAccountPage() {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!canAccessCustomer(auth.user)) {
    return <Navigate to={getPostAuthPath(auth.user, auth.user.pendingLinkCount)} replace />;
  }

  return (
    <CustomerPage user={auth.user} activeNav="shops" pageTitle="Shop Account">
      <SharedAccountContent backLink="/portal/shops" backLabel="My Shops" viewerRole="customer" />
    </CustomerPage>
  );
}
