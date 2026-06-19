import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Store,
  MapPin,
  Check,
  X,
  Loader2,
  ChevronRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Home,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { getAuth, getPostAuthPath, canAccessCustomer } from '../../services/auth';
import CustomerPage from '../../components/app/CustomerPage';
import PageHeader from '../../components/app/PageHeader';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import {
  fetchPendingLinks,
  fetchPendingLinkDetail,
  fetchLinkedShops,
  acceptShopLink,
  rejectShopLink,
} from '../../services/links';
import { formatRs } from '../../utils/format';
import { useAppDialog } from '../../contexts/AppDialogContext';
import '../../components/app/AppPages.css';
import './LinkShopsPage.css';

function shopBadge(inv) {
  if (inv.shopVerified) return 'app-badge--success';
  if (inv.shopVerificationStatus === 'pending') return 'app-badge--warn';
  return 'app-badge--muted';
}

function shopBadgeLabel(inv) {
  if (inv.shopVerified) return 'Verified shop';
  if (inv.shopVerificationStatus === 'pending') return 'Pending verification';
  return 'Unverified shop';
}

function DetailRow({ icon: Icon, label, value, highlight }) {
  if (!value) return null;
  return (
    <div className={`link-shop-detail__row ${highlight ? 'link-shop-detail__row--highlight' : ''}`}>
      <Icon size={16} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export function LinkShopDetailPage() {
  const { customerId } = useParams();
  const auth = getAuth();
  const navigate = useNavigate();
  const { alert, confirm } = useAppDialog();
  const { data, loading, error, reload } = useApi(
    () => fetchPendingLinkDetail(customerId),
    [customerId]
  );
  const [acting, setActing] = useState('');

  if (!auth) return <Navigate to="/login" replace />;
  if (!canAccessCustomer(auth.user)) {
    return <Navigate to={getPostAuthPath(auth.user, auth.user.pendingLinkCount)} replace />;
  }

  const inv = data?.invitation;

  const handleAccept = async () => {
    const ok = await confirm({
      title: 'Accept shop invitation?',
      message: `Link your account with ${inv.shopName}? You will be able to view credits and message this shop.`,
      confirmLabel: 'Accept',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;

    setActing('accept');
    try {
      await acceptShopLink(customerId);
      navigate('/portal', { replace: true });
    } catch (err) {
      await alert({ title: 'Could not accept', message: err.message, variant: 'error' });
    } finally {
      setActing('');
    }
  };

  const handleReject = async () => {
    const ok = await confirm({
      title: 'Decline invitation?',
      message: `Are you sure you want to decline the invitation from ${inv.shopName}?`,
      confirmLabel: 'Decline',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setActing('reject');
    try {
      await rejectShopLink(customerId);
      navigate('/portal/link-shops', { replace: true });
    } catch (err) {
      await alert({ title: 'Could not decline', message: err.message, variant: 'error' });
    } finally {
      setActing('');
    }
  };

  const emailMatches = inv?.email?.toLowerCase() === auth.user.email?.toLowerCase();

  return (
    <CustomerPage user={auth.user} activeNav="link-shops" pageTitle="Review Invitation" pageSubtitle="Verify shop details before accepting">
      <PageHeader
        title="Review Shop Invitation"
        subtitle="Check that the shop and your registered details are correct before you respond."
        breadcrumbs={[
          { label: 'Invitations', to: '/portal/link-shops' },
          { label: inv?.shopName || 'Details' },
        ]}
        actions={
          <Link to="/portal/link-shops" className="app-btn app-btn--outline">
            <ArrowLeft size={16} /> Back
          </Link>
        }
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && inv && (
        <div className="link-shop-detail">
          <section className="link-shop-detail__hero app-card">
            <div className="link-shop-detail__shop">
              {inv.shopImage ? (
                <img src={inv.shopImage} alt={inv.shopName} className="link-shop-detail__shop-image" />
              ) : (
                <span className="link-shop-detail__shop-placeholder">
                  <Store size={28} />
                </span>
              )}
              <div className="link-shop-detail__shop-info">
                <div className="link-shop-detail__shop-head">
                  <h2>{inv.shopName}</h2>
                  <span className={`app-badge ${shopBadge(inv)}`}>{shopBadgeLabel(inv)}</span>
                </div>
                <p className="link-shop-detail__owner">Owner: {inv.shopkeeperName}</p>
                {inv.shopLocation && (
                  <p className="link-shop-detail__location">
                    <MapPin size={15} /> {inv.shopLocation}
                  </p>
                )}
                {inv.shopkeeperPhone && (
                  <p className="link-shop-detail__location">
                    <Phone size={15} /> {inv.shopkeeperPhone}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="link-shop-detail__panel app-card">
            <h3>Your details as registered by this shop</h3>
            <p className="link-shop-detail__panel-note">
              Confirm these match you. The shopkeeper entered this information when adding you as a customer.
            </p>
            {!emailMatches && (
              <div className="link-shop-detail__alert">
                <AlertCircle size={16} />
                <span>
                  The email on this record ({inv.email || '—'}) differs from your account email ({auth.user.email}).
                  Only accept if you trust this shop.
                </span>
              </div>
            )}
            <div className="link-shop-detail__grid">
              <DetailRow icon={User} label="Name on record" value={inv.name} />
              <DetailRow icon={Mail} label="Email on record" value={inv.email} highlight={!emailMatches} />
              <DetailRow icon={Phone} label="Phone on record" value={inv.phone} />
              <DetailRow icon={Home} label="Address on record" value={inv.address} />
            </div>
          </section>

          <section className="link-shop-detail__panel app-card">
            <h3>Account summary</h3>
            <div className="link-shop-detail__grid">
              <DetailRow icon={CalendarDays} label="Invited on" value={inv.invitedAt} />
              <DetailRow
                icon={ShieldCheck}
                label="Current due"
                value={formatRs(inv.balance)}
                highlight={inv.balance > 0}
              />
            </div>
          </section>

          <section className="link-shop-detail__actions app-card">
            <p className="link-shop-detail__hint">
              By accepting, you confirm this shop account belongs to you and can view all credit records and message the shopkeeper.
            </p>
            <div className="link-shop-detail__buttons">
              <button
                type="button"
                className="app-btn app-btn--primary"
                disabled={Boolean(acting)}
                onClick={handleAccept}
              >
                {acting === 'accept' ? <Loader2 size={16} className="auth-spinner" /> : <Check size={16} />}
                Accept invitation
              </button>
              <button
                type="button"
                className="app-btn app-btn--outline"
                disabled={Boolean(acting)}
                onClick={handleReject}
              >
                {acting === 'reject' ? <Loader2 size={16} className="auth-spinner" /> : <X size={16} />}
                Decline
              </button>
            </div>
          </section>
        </div>
      )}
    </CustomerPage>
  );
}

export function LinkShopsPage() {
  const auth = getAuth();
  const { alert } = useAppDialog();
  const { data, loading, error, reload } = useApi(() => fetchPendingLinks(), []);
  const [acting, setActing] = useState(null);

  if (!auth) return <Navigate to="/login" replace />;
  if (!canAccessCustomer(auth.user)) {
    return <Navigate to={getPostAuthPath(auth.user, auth.user.pendingLinkCount)} replace />;
  }

  const invitations = data?.invitations || [];

  const handleReject = async (customerId) => {
    setActing(customerId);
    try {
      await rejectShopLink(customerId);
      reload();
    } catch (err) {
      await alert({ title: 'Could not decline', message: err.message, variant: 'error' });
    } finally {
      setActing(null);
    }
  };

  return (
    <CustomerPage user={auth.user} activeNav="link-shops" pageTitle="Shop Invitations" pageSubtitle="Review and respond to shop invitations">
      <PageHeader
        title="Link Your Shop Accounts"
        subtitle="Review each invitation to verify the shop and your registered details before accepting."
      />

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && invitations.length === 0 && (
        <div className="app-card app-empty">
          <p>No pending shop invitations.</p>
          <Link to="/portal" className="app-btn app-btn--primary" style={{ marginTop: 12 }}>Go to Dashboard</Link>
        </div>
      )}

      <div className="link-shops-grid">
        {invitations.map((inv) => (
          <article key={inv.id} className="link-shop-card app-card">
            <div className="link-shop-card__head">
              {inv.shopImage ? (
                <img src={inv.shopImage} alt="" className="link-shop-card__thumb" />
              ) : (
                <span className="link-shop-card__icon"><Store size={22} /></span>
              )}
              <div>
                <h3>{inv.shopName}</h3>
                <p>{inv.shopkeeperName}</p>
              </div>
              <span className={`app-badge ${shopBadge(inv)}`}>{shopBadgeLabel(inv)}</span>
            </div>
            <div className="link-shop-card__meta">
              {inv.shopLocation && <span><MapPin size={14} /> {inv.shopLocation}</span>}
              <span>Registered as: <strong>{inv.name}</strong></span>
              <span>Current due: <strong className="text-danger">{formatRs(inv.balance)}</strong></span>
              {inv.invitedAt && <span><CalendarDays size={14} /> Invited {inv.invitedAt}</span>}
            </div>
            <p className="link-shop-card__hint">
              View full shop and account details before accepting or declining.
            </p>
            <div className="link-shop-card__actions">
              <Link to={`/portal/link-shops/${inv.id}`} className="app-btn app-btn--primary">
                Review details <ChevronRight size={16} />
              </Link>
              <button
                type="button"
                className="app-btn app-btn--outline"
                disabled={acting === inv.id}
                onClick={() => handleReject(inv.id)}
              >
                {acting === inv.id ? <Loader2 size={16} className="auth-spinner" /> : <X size={16} />}
                Decline
              </button>
            </div>
          </article>
        ))}
      </div>
    </CustomerPage>
  );
}

export function MyLinkedShopsPage() {
  const auth = getAuth();
  const { data, loading, error, reload } = useApi(() => fetchLinkedShops(), []);

  if (!auth) return <Navigate to="/login" replace />;

  const shops = data?.shops || [];

  return (
    <CustomerPage user={auth.user} activeNav="shops" pageTitle="My Shops" pageSubtitle="Linked shop accounts">
      <PageHeader title="Linked Shops" subtitle="View credits and message your shopkeepers" />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && (
        <div className="link-shops-grid">
          {shops.map((shop) => (
            <Link key={shop.id} to={`/portal/shops/${shop.id}`} className="link-shop-card app-card link-shop-card--linked">
              <div className="link-shop-card__head">
                {shop.shopImage ? (
                  <img src={shop.shopImage} alt="" className="link-shop-card__thumb" />
                ) : (
                  <span className="link-shop-card__icon"><Store size={22} /></span>
                )}
                <div>
                  <h3>{shop.shopName}</h3>
                  <p>{shop.shopkeeperName}</p>
                </div>
                <span className="app-badge app-badge--success">Linked</span>
              </div>
              <p>Due: <strong className="text-danger">{formatRs(shop.balance)}</strong></p>
              <span className="app-link-btn">View credits & messages →</span>
            </Link>
          ))}
          {!shops.length && <div className="app-empty">No linked shops yet. Accept an invitation first.</div>}
        </div>
      )}
    </CustomerPage>
  );
}
