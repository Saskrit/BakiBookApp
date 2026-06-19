import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Flag, Eye } from 'lucide-react';
import ShopkeeperPage, { useShopkeeperUser } from '../../components/app/ShopkeeperPage';
import Pagination from '../../components/app/Pagination';
import { useApi, LoadingState, ErrorState } from '../../hooks/useApi';
import {
  fetchShopkeeperSubmissions,
  acceptPaymentSubmission,
  rejectPaymentSubmission,
  reportPaymentSubmission,
} from '../../services/paymentSubmissions';
import { formatRs } from '../../utils/format';
import { PAGE_SIZE } from '../../constants/pagination';
import { useAppDialog } from '../../contexts/AppDialogContext';
import '../../components/app/AppPages.css';
import './PaymentSubmissionsPage.css';

const statusClass = {
  pending: 'pay-sub-status--pending',
  accepted: 'pay-sub-status--accepted',
  rejected: 'pay-sub-status--rejected',
  reported: 'pay-sub-status--reported',
};

export function PaymentSubmissionsPage() {
  const user = useShopkeeperUser();
  const { confirm, prompt, alert } = useAppDialog();
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [acting, setActing] = useState('');
  const { data, loading, error, reload } = useApi(
    () => fetchShopkeeperSubmissions({
      status: tab === 'pending' ? 'pending' : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [tab, page]
  );
  const submissions = data?.submissions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleTabChange = (next) => {
    setTab(next);
    setPage(1);
  };

  const handleAccept = async (submission) => {
    const ok = await confirm({
      title: 'Accept payment?',
      message: `Accept Rs. ${submission.amount.toLocaleString('en-NP')} from ${submission.customerName}? Balance will be updated.`,
      confirmLabel: 'Accept',
    });
    if (!ok) return;

    setActing(submission.id);
    try {
      await acceptPaymentSubmission(submission.id);
      await reload();
      await alert({ title: 'Accepted', message: 'Payment recorded and customer balance updated.', variant: 'success' });
    } catch (err) {
      await alert({ title: 'Error', message: err.message, variant: 'danger' });
    } finally {
      setActing('');
    }
  };

  const handleReject = async (submission) => {
    const note = await prompt({
      title: 'Reject payment',
      message: 'Reason for rejection (customer will be notified):',
      placeholder: 'Screenshot unclear, wrong amount, etc.',
    });
    if (!note?.trim()) return;

    setActing(submission.id);
    try {
      await rejectPaymentSubmission(submission.id, { note: note.trim() });
      await reload();
    } catch (err) {
      await alert({ title: 'Error', message: err.message, variant: 'danger' });
    } finally {
      setActing('');
    }
  };

  const handleReport = async (submission) => {
    const reason = await prompt({
      title: 'Report payment',
      message: 'Describe the issue with this payment submission:',
      placeholder: 'Suspected fake screenshot, duplicate payment, etc.',
    });
    if (!reason?.trim()) return;

    setActing(submission.id);
    try {
      await reportPaymentSubmission(submission.id, { reason: reason.trim() });
      await reload();
    } catch (err) {
      await alert({ title: 'Error', message: err.message, variant: 'danger' });
    } finally {
      setActing('');
    }
  };

  return (
    <ShopkeeperPage
      user={user}
      activeNav="transactions"
      pageTitle="Payment Submissions"
      pageSubtitle="Review customer payment screenshots"
      breadcrumbs={[{ label: 'Credits & Payments', to: '/shop/transactions' }, { label: 'Submissions' }]}
      actions={<Link to="/shop/transactions" className="app-btn app-btn--outline app-btn--sm">Credits & payments</Link>}
    >
      <div className="pay-sub-tabs">
        <button type="button" className={tab === 'pending' ? 'active' : ''} onClick={() => handleTabChange('pending')}>
          Pending
        </button>
        <button type="button" className={tab === 'all' ? 'active' : ''} onClick={() => handleTabChange('all')}>
          All
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !submissions.length ? (
        <div className="app-empty">No payment submissions{tab === 'pending' ? ' pending review' : ''}.</div>
      ) : (
        <>
          <div className="pay-sub-list">
            {submissions.map((s) => (
            <div key={s.id} className="app-card pay-sub-card">
              <div className="pay-sub-card__top">
                <div>
                  <strong>{s.customerName}</strong>
                  <p>{s.payLabel || s.payType} · {s.method} · {s.date} {s.time}</p>
                </div>
                <span className={`pay-sub-status ${statusClass[s.status] || ''}`}>{s.status}</span>
              </div>

              <div className="pay-sub-card__body">
                <div>
                  <p className="pay-sub-amount">{formatRs(s.amount)}</p>
                  {s.note && <p className="pay-sub-note">Customer note: {s.note}</p>}
                  {s.reviewNote && <p className="pay-sub-note">Review: {s.reviewNote}</p>}
                  {s.paymentId && (
                    <Link to={`/shop/payments/${s.paymentId}`} className="app-link-btn">
                      View recorded payment →
                    </Link>
                  )}
                </div>
                {s.screenshotUrl && (
                  <a href={s.screenshotUrl} target="_blank" rel="noreferrer" className="pay-sub-screenshot">
                    <img src={s.screenshotUrl} alt="Payment screenshot" />
                    <span><Eye size={14} /> View screenshot</span>
                  </a>
                )}
              </div>

              {s.status === 'pending' && (
                <div className="pay-sub-card__actions">
                  <button
                    type="button"
                    className="app-btn app-btn--primary"
                    disabled={acting === s.id}
                    onClick={() => handleAccept(s)}
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn--outline"
                    disabled={acting === s.id}
                    onClick={() => handleReject(s)}
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn--danger"
                    disabled={acting === s.id}
                    onClick={() => handleReport(s)}
                  >
                    <Flag size={16} /> Report
                  </button>
                </div>
              )}
            </div>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={setPage} />
        </>
      )}
    </ShopkeeperPage>
  );
}
