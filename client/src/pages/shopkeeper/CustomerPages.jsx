import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Eye, MessageCircle } from 'lucide-react';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import DataTable, { ActionIcon } from '../../components/app/DataTable';
import Pagination from '../../components/app/Pagination';
import CustomerReportDownloadButton from '../../components/shopkeeper/CustomerReportDownloadButton';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import { fetchCustomers, fetchCustomer, createCustomer, updateCustomer } from '../../services/customers';
import { formatRs, creditScoreClass } from '../../utils/format';
import { PAGE_SIZE } from '../../constants/pagination';
import '../../components/app/AppPages.css';

export function CustomerListPage() {
  const user = useShopkeeperUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useApi(
    () => fetchCustomers({ search, status, page, limit: PAGE_SIZE }),
    [search, status, page]
  );
  const customers = data?.customers || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => (
        <div className="app-table-user">
          <span className="app-table-avatar">{row.avatar}</span>
          <div>
            <strong>{row.name}</strong>
            <small>{row.phone || row.email || 'No contact info'}</small>
          </div>
        </div>
      ),
    },
    {
      key: 'creditScore',
      label: 'Score',
      render: (row) => (
        <span className={`app-badge ${creditScoreClass(row.creditScore)}`}>{row.creditScore}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Due',
      render: (row) => (
        <strong className={row.balance > 0 ? 'text-danger' : ''}>{formatRs(row.balance)}</strong>
      ),
    },
    {
      key: 'linkStatus',
      label: 'Link',
      render: (row) => (
        <span className={`app-badge ${
          row.linkStatus === 'linked' ? 'app-badge--success'
            : row.linkStatus === 'pending' ? 'app-badge--warn'
              : 'app-badge--muted'
        }`}>
          {row.linkStatus === 'linked' ? 'Verified' : row.linkStatus === 'pending' ? 'Unverified' : row.linkStatus}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`app-badge ${row.status === 'active' ? 'app-badge--success' : 'app-badge--muted'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="app-table-actions">
          <ActionIcon to={`/shop/customers/${row.id}`} label="View customer">
            <Eye size={16} />
          </ActionIcon>
          {row.linkStatus === 'linked' && (
            <ActionIcon to={`/shop/messages/${row.id}`} label="Message customer">
              <MessageCircle size={16} />
            </ActionIcon>
          )}
          <ActionIcon to={`/shop/customers/${row.id}/edit`} label="Edit customer">
            <Pencil size={16} />
          </ActionIcon>
        </div>
      ),
    },
  ];

  return (
    <ShopkeeperPage
      user={user}
      activeNav="customers"
      pageTitle="Customers"
      pageSubtitle={`${pagination.total} registered`}
      actions={
        <Link to="/shop/customers/new" className="app-btn app-btn--primary app-btn--sm">
          <Plus size={16} /> Add Customer
        </Link>
      }
    >
      <div className="app-filter-bar">
        <input
          type="search"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <DataTable columns={columns} rows={customers} />
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

export function AddCustomerPage() {
  const user = useShopkeeperUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', status: 'active', notes: '' });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { customer } = await createCustomer(form);
      navigate(`/shop/customers/${customer.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="customers"
      pageTitle="Add Customer"
      pageSubtitle="Register a new customer for credit tracking"
      breadcrumbs={[{ label: 'Customers', to: '/shop/customers' }, { label: 'Add' }]}
    >
      <div className="app-card">
        {error && <p className="text-danger" style={{ marginBottom: 12 }}>{error}</p>}
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-grid-2">
            <div className="app-field"><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} required placeholder="Customer name" /></div>
            <div className="app-field"><label>Phone <span className="app-field__hint">(optional)</span></label><input name="phone" value={form.phone} onChange={handleChange} placeholder="98XXXXXXXX" /></div>
            <div className="app-field"><label>Email <span className="app-field__hint">(optional — for account linking)</span></label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" /></div>
            <div className="app-field"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div className="app-field"><label>Address</label><input name="address" value={form.address} onChange={handleChange} placeholder="Ward, area, city" /></div>
          <div className="app-field"><label>Notes</label><textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." /></div>
          <div className="app-page-header__actions">
            <button type="submit" className="app-btn app-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
            <Link to="/shop/customers" className="app-btn app-btn--outline">Cancel</Link>
          </div>
        </form>
      </div>
    </ShopkeeperPage>
  );
}

export function CustomerDetailPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(() => fetchCustomer(id), [id]);
  const customer = data?.customer;

  if (loading) {
    return <ShopkeeperPage user={user} activeNav="customers"><LoadingState /></ShopkeeperPage>;
  }

  if (error || !customer) {
    return (
      <ShopkeeperPage user={user} activeNav="customers">
        <ErrorState message={error || 'Customer not found.'} onRetry={reload} />
        <Link to="/shop/customers">Back to list</Link>
      </ShopkeeperPage>
    );
  }

  return (
    <ShopkeeperPage
      user={user}
      activeNav="customers"
      pageTitle={customer.name}
      pageSubtitle={`Member since ${customer.joined}`}
      breadcrumbs={[{ label: 'Customers', to: '/shop/customers' }, { label: customer.name }]}
      actions={
        <>
          <CustomerReportDownloadButton customerId={id} shopName={user?.shopName} label="Full report PDF" />
          <Link to={`/shop/customers/${id}/edit`} className="app-btn app-btn--outline app-btn--sm">
            <Pencil size={16} /> Edit
          </Link>
        </>
      }
    >
      <div className="app-grid-2">
        <div className="app-card">
          <h3 className="app-card__title">Profile</h3>
          <div className="app-detail-grid">
            <div className="app-detail-item"><label>Phone</label><p>{customer.phone || '—'}</p></div>
            <div className="app-detail-item"><label>Email</label><p>{customer.email || '—'}</p></div>
            <div className="app-detail-item"><label>Address</label><p>{customer.address || '—'}</p></div>
            <div className="app-detail-item"><label>Credit Score</label><p><span className={`app-badge ${creditScoreClass(customer.creditScore)}`}>{customer.creditScore}</span></p></div>
            <div className="app-detail-item"><label>Account Link</label><p><span className={`app-badge ${customer.isLinked ? 'app-badge--success' : 'app-badge--warn'}`}>{customer.isLinked ? 'Verified customer' : 'Unverified — awaiting customer signup'}</span></p></div>
          </div>
        </div>
        <div className="app-card">
          <h3 className="app-card__title">Account Summary</h3>
          <div className="app-stat-mini"><span>Outstanding Due</span><strong className="danger">{formatRs(customer.balance)}</strong></div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to={`/shop/credit/new?customer=${id}`} className="app-btn app-btn--primary">Add Credit</Link>
            <Link to={`/shop/payments/new?customer=${id}`} className="app-btn app-btn--outline">Record Payment</Link>
            {customer.isLinked && (
              <Link to={`/shop/messages/${id}`} className="app-btn app-btn--outline"><MessageCircle size={16} /> Message</Link>
            )}
            <Link to={`/shop/customers/${id}/account`} className="app-btn app-btn--outline">Credits & Ledger</Link>
            <Link to={`/shop/ledger/${id}`} className="app-btn app-btn--outline">View Ledger</Link>
          </div>
        </div>
      </div>
      {customer.notes && <div className="app-card"><h3 className="app-card__title">Notes</h3><p>{customer.notes}</p></div>}
    </ShopkeeperPage>
  );
}

export function EditCustomerPage() {
  const user = useShopkeeperUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => fetchCustomer(id), [id]);
  const customer = data?.customer;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [saveError, setSaveError] = useState('');

  if (loading) return <ShopkeeperPage user={user} activeNav="customers"><LoadingState /></ShopkeeperPage>;
  if (error || !customer) return <CustomerDetailPage />;

  const values = form || {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    notes: customer.notes,
  };

  const handleChange = (e) => setForm((f) => ({ ...(f || values), [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await updateCustomer(id, values);
      navigate(`/shop/customers/${id}`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="customers"
      pageTitle="Edit Customer"
      breadcrumbs={[
        { label: 'Customers', to: '/shop/customers' },
        { label: customer.name, to: `/shop/customers/${id}` },
        { label: 'Edit' },
      ]}
    >
      <div className="app-card">
        {saveError && <p className="text-danger" style={{ marginBottom: 12 }}>{saveError}</p>}
        <form className="app-form" onSubmit={handleSubmit}>
          <div className="app-grid-2">
            <div className="app-field"><label>Full Name</label><input name="name" value={values.name} onChange={handleChange} required /></div>
            <div className="app-field"><label>Phone <span className="app-field__hint">(optional)</span></label><input name="phone" value={values.phone} onChange={handleChange} /></div>
            <div className="app-field"><label>Email <span className="app-field__hint">(optional)</span></label><input name="email" type="email" value={values.email} onChange={handleChange} /></div>
            <div className="app-field"><label>Status</label><select name="status" value={values.status} onChange={handleChange}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <div className="app-field"><label>Address</label><input name="address" value={values.address} onChange={handleChange} /></div>
          <div className="app-field"><label>Notes</label><textarea name="notes" value={values.notes} onChange={handleChange} /></div>
          <button type="submit" className="app-btn app-btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Update Customer'}</button>
        </form>
      </div>
    </ShopkeeperPage>
  );
}
