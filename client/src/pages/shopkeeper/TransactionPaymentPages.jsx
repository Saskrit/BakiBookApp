import { useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Eye } from 'lucide-react';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import DataTable, { ActionLink } from '../../components/app/DataTable';
import Pagination from '../../components/app/Pagination';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { fetchCustomers } from '../../services/customers';
import { fetchTransaction, createTransaction, updateTransaction } from '../../services/transactions';
import { fetchPayment, createPayment } from '../../services/payments';
import { fetchShopActivity } from '../../services/shop';
import { formatRs } from '../../utils/format';
import { PAGE_SIZE } from '../../constants/pagination';
import '../../components/app/AppPages.css';

const LIST_HOME = { label: 'Credits & Payments', to: '/shop/transactions' };

export function AddCreditPage() {
  const user = useShopkeeperUser();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const prefill = params.get('customer');
  const { data: custData } = useApi(() => fetchCustomers({ all: 'true' }), []);
  const customers = custData?.customers || [];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerId: prefill || '',
    itemName: '',
    qty: 1,
    price: '',
    note: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createTransaction({
        customerId: form.customerId,
        items: [{ name: form.itemName, qty: Number(form.qty), price: Number(form.price) }],
        note: form.note,
      });
      navigate('/shop/transactions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Add Credit"
      pageSubtitle="Record items purchased on credit"
      breadcrumbs={[LIST_HOME, { label: 'Add Credit' }]}
    >
      <div className="app-card">
        {error && <p className="text-danger" style={{ marginBottom: 12 }}>{error}</p>}
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-field">
            <label>Customer</label>
            <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} required>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="app-grid-3">
            <div className="app-field"><label>Item Name</label><input value={form.itemName} onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))} placeholder="Product name" required /></div>
            <div className="app-field"><label>Quantity</label><input type="number" min="1" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} required /></div>
            <div className="app-field"><label>Unit Price (Rs.)</label><input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required /></div>
          </div>
          <div className="app-field"><label>Notes</label><textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional note..." /></div>
          <button type="submit" className="app-btn app-btn--primary" disabled={saving}><Plus size={16} /> {saving ? 'Saving...' : 'Save Credit'}</button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}

export function CreditPaymentListPage() {
  const user = useShopkeeperUser();
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(
    () => fetchShopActivity({ page, limit: PAGE_SIZE }),
    [page]
  );

  const rows = data?.activity || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const columns = [
    { key: 'date', label: 'Date & Time', render: (r) => `${r.date} · ${r.time}` },
    {
      key: 'kind',
      label: 'Type',
      render: (r) => (
        <span className={`app-type-pill app-type-pill--${r.kind}`}>
          {r.kind === 'credit' ? 'Credit' : 'Payment'}
        </span>
      ),
    },
    { key: 'customerName', label: 'Customer' },
    { key: 'productFor', label: 'Product / Paid for' },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => (
        <span className={`app-ledger-amount app-ledger-amount--${r.kind}`}>
          {r.kind === 'credit' ? '+' : '−'}
          {formatRs(r.amount)}
        </span>
      ),
    },
    { key: 'method', label: 'Method' },
    { key: 'reference', label: 'Note / Receipt' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="app-table-actions">
          <ActionLink to={r.viewTo}><Eye size={14} /> View</ActionLink>
          {r.editTo && (
            <ActionLink to={r.editTo} variant="muted"><Pencil size={14} /> Edit</ActionLink>
          )}
        </div>
      ),
    },
  ];

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Credits & Payments"
      pageSubtitle={`${pagination.total} records`}
      actions={
        <>
          <Link to="/shop/payment-submissions" className="app-btn app-btn--outline app-btn--sm">
            Review submissions
          </Link>
          <Link to="/shop/payments/new" className="app-btn app-btn--outline app-btn--sm">
            <Plus size={16} /> Record Payment
          </Link>
          <Link to="/shop/credit/new" className="app-btn app-btn--primary app-btn--sm">
            <Plus size={16} /> Add Credit
          </Link>
        </>
      }
    >
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <DataTable columns={columns} rows={rows} emptyMessage="No credits or payments yet." />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        </>
      )}
    </ShopkeeperPage>
  );
}

export const TransactionListPage = CreditPaymentListPage;
export const PaymentListPage = CreditPaymentListPage;

export function TransactionDetailPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const { data, loading, error } = useApi(() => fetchTransaction(id), [id]);
  const tx = data?.transaction;

  if (loading) return <ShopkeeperPage user={user} activeNav="transactions"><LoadingState /></ShopkeeperPage>;
  if (error || !tx) return <ShopkeeperPage user={user} activeNav="transactions"><div className="app-empty">Transaction not found.</div></ShopkeeperPage>;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Transaction Details"
      breadcrumbs={[LIST_HOME, { label: tx.id.slice(-6) }]}
      actions={
        <Link to={`/shop/transactions/${id}/edit`} className="app-btn app-btn--outline app-btn--sm">
          <Pencil size={16} /> Edit
        </Link>
      }
    >
      <div className="app-card">
        <div className="app-detail-grid">
          <div className="app-detail-item"><label>Customer</label><p>{tx.customerName}</p></div>
          <div className="app-detail-item"><label>Date</label><p>{tx.date} {tx.time}</p></div>
          <div className="app-detail-item"><label>Total</label><p>{formatRs(tx.total)}</p></div>
          <div className="app-detail-item"><label>Note</label><p>{tx.note || '—'}</p></div>
        </div>
        <h3 className="app-card__title" style={{ marginTop: 16 }}>Items</h3>
        <DataTable columns={[{ key: 'name', label: 'Item' }, { key: 'qty', label: 'Qty' }, { key: 'price', label: 'Price', render: (r) => formatRs(r.price) }]} rows={tx.items.map((i, idx) => ({ ...i, id: idx }))} />
      </div>
    </ShopkeeperPage>
  );
}

export function EditTransactionPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useApi(() => fetchTransaction(id), [id]);
  const tx = data?.transaction;
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [total, setTotal] = useState('');

  if (loading) return <ShopkeeperPage user={user} activeNav="transactions"><LoadingState /></ShopkeeperPage>;
  if (!tx) return <TransactionDetailPage />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTransaction(id, { note: note || tx.note, total: Number(total || tx.total) });
      navigate(`/shop/transactions/${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Edit Transaction"
      breadcrumbs={[LIST_HOME, { label: tx.id.slice(-6), to: `/shop/transactions/${id}` }, { label: 'Edit' }]}
    >
      <div className="app-card">
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-field"><label>Customer</label><input defaultValue={tx.customerName} disabled /></div>
          <div className="app-grid-2">
            <div className="app-field"><label>Total (Rs.)</label><input type="number" defaultValue={tx.total} onChange={(e) => setTotal(e.target.value)} /></div>
            <div className="app-field"><label>Date</label><input type="date" defaultValue={tx.date} disabled /></div>
          </div>
          <div className="app-field"><label>Notes</label><textarea defaultValue={tx.note} onChange={(e) => setNote(e.target.value)} /></div>
          <button type="submit" className="app-btn app-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}

export function RecordPaymentPage() {
  const user = useShopkeeperUser();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: custData } = useApi(() => fetchCustomers({ all: 'true' }), []);
  const customers = custData?.customers || [];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerId: params.get('customer') || '',
    amount: '',
    method: 'Cash',
    note: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createPayment(form);
      navigate('/shop/transactions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Record Payment"
      breadcrumbs={[LIST_HOME, { label: 'Record' }]}
    >
      <div className="app-card">
        {error && <p className="text-danger" style={{ marginBottom: 12 }}>{error}</p>}
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-field">
            <label>Customer</label>
            <select value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} required>
              <option value="">Select</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {formatRs(c.balance)} due</option>)}
            </select>
          </div>
          <div className="app-grid-2">
            <div className="app-field"><label>Amount (Rs.)</label><input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required /></div>
            <div className="app-field"><label>Method</label><select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}><option>Cash</option><option>eSewa</option><option>Khalti</option><option>Bank Transfer</option></select></div>
          </div>
          <div className="app-field"><label>Notes</label><textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} /></div>
          <button type="submit" className="app-btn app-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Record Payment'}</button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}

export function PaymentDetailPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const { data, loading, error } = useApi(() => fetchPayment(id), [id]);
  const payment = data?.payment;

  if (loading) return <ShopkeeperPage user={user} activeNav="transactions"><LoadingState /></ShopkeeperPage>;
  if (error || !payment) return <ShopkeeperPage user={user} activeNav="transactions"><div className="app-empty">Payment not found.</div></ShopkeeperPage>;

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Payment Details"
      breadcrumbs={[LIST_HOME, { label: payment.receiptNo }]}
    >
      <div className="app-card">
        <div className="app-detail-grid">
          <div className="app-detail-item"><label>Customer</label><p>{payment.customerName}</p></div>
          <div className="app-detail-item"><label>Paid for</label><p>{payment.paidFor || 'General payment'}</p></div>
          <div className="app-detail-item"><label>Amount</label><p>{formatRs(payment.amount)}</p></div>
          <div className="app-detail-item"><label>Method</label><p>{payment.method}</p></div>
          <div className="app-detail-item"><label>Receipt</label><p>{payment.receiptNo}</p></div>
          {payment.transactionId && (
            <div className="app-detail-item">
              <label>Linked credit</label>
              <p>
                <Link to={`/shop/transactions/${payment.transactionId}`} className="app-link-btn">
                  View credit bill
                </Link>
              </p>
            </div>
          )}
          <div className="app-detail-item"><label>Date</label><p>{payment.date} {payment.time}</p></div>
          <div className="app-detail-item"><label>Note</label><p>{payment.note || '—'}</p></div>
          {payment.screenshotUrl && (
            <div className="app-detail-item app-detail-item--full">
              <label>Payment screenshot</label>
              <a href={payment.screenshotUrl} target="_blank" rel="noreferrer">
                <img src={payment.screenshotUrl} alt="Payment screenshot" style={{ maxWidth: 280, borderRadius: 10, marginTop: 8 }} />
              </a>
            </div>
          )}
        </div>
      </div>
    </ShopkeeperPage>
  );
}
