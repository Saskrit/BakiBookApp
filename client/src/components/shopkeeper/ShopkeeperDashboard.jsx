import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Receipt,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Plus,
  ArrowDownLeft,
  ShieldCheck,
  Mail,
  Loader2,
  UserPlus,
  Send,
  BarChart3,
  Settings,
} from 'lucide-react';
import ShopkeeperLayout from './ShopkeeperLayout';
import { resendVerification, needsShopSetup, isShopPendingVerification } from '../../services/auth';
import { fetchDashboardStats } from '../../services/shop';
import { formatRs } from '../../utils/format';
import './ShopkeeperDashboard.css';

const statCardMeta = [
  { label: 'Total Customers', key: 'totalCustomers', icon: Users, iconBg: 'sk-stat__icon--green', trendKey: 'weekCustomers', trendType: 'up', format: (v) => String(v ?? 0) },
  { label: 'Total Outstanding', key: 'totalOutstanding', icon: Receipt, iconBg: 'sk-stat__icon--red', trendKey: 'weekCredit', trendType: 'danger', format: formatRs },
  { label: 'Total Credit (Given)', key: 'totalCredit', icon: ShoppingCart, iconBg: 'sk-stat__icon--orange', trendKey: 'weekCredit', trendType: 'warn', format: formatRs },
  { label: 'Total Payments (Received)', key: 'totalPayments', icon: Wallet, iconBg: 'sk-stat__icon--green', trendKey: 'weekPayment', trendType: 'up', format: formatRs },
  { label: "Today's Transactions", key: 'todayTransactions', icon: TrendingUp, iconBg: 'sk-stat__icon--blue', trendKey: null, trendType: 'info', format: (v) => String(v ?? 0) },
];

const quickActions = [
  { label: 'Add Customer', icon: UserPlus, tone: 'green', to: '/shop/customers/new' },
  { label: 'Add Credit', icon: Plus, tone: 'red', to: '/shop/credit/new' },
  { label: 'Record Payment', icon: Wallet, tone: 'green', to: '/shop/payments/new' },
  { label: 'Send Reminder', icon: Send, tone: 'orange', to: '/shop/reminders/send' },
  { label: 'Shop Settings', icon: Settings, tone: 'blue', to: '/shop/settings' },
  { label: 'Generate Report', icon: BarChart3, tone: 'blue', to: '/shop/reports' },
];

function buildLinePath(values, width, height, padding = 8) {
  if (!values?.length) return '';

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((val, i) => {
      const x = padding + i * step;
      const y = padding + (height - padding * 2) * (1 - (val - min) / range);
      return `${x},${y}`;
    })
    .join(' ');
}

function CreditPaymentChart({ credit = [], payment = [] }) {
  const w = 560;
  const h = 180;
  const creditPath = buildLinePath(credit, w, h);
  const paymentPath = buildLinePath(payment, w, h);
  const hasData = credit.some((v) => v > 0) || payment.some((v) => v > 0);

  if (!hasData) {
    return <p className="sk-panel__empty">No credit or payment activity in the last 30 days.</p>;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sk-chart__svg" preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="8"
          y1={8 + (i * (h - 16)) / 4}
          x2={w - 8}
          y2={8 + (i * (h - 16)) / 4}
          className="sk-chart__grid"
        />
      ))}
      {creditPath && <polyline points={creditPath} className="sk-chart__line sk-chart__line--credit" />}
      {paymentPath && <polyline points={paymentPath} className="sk-chart__line sk-chart__line--payment" />}
    </svg>
  );
}

function AgingDonut({ agingData = [], totalOutstanding = 0 }) {
  const total = agingData.reduce((sum, item) => sum + item.percent, 0);
  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  if (!totalOutstanding) {
    return <p className="sk-panel__empty">No outstanding balances to analyze.</p>;
  }

  return (
    <div className="sk-aging">
      <div className="sk-aging__chart-wrap">
        <svg viewBox="0 0 140 140" className="sk-aging__svg">
          <circle cx="70" cy="70" r={radius} className="sk-aging__track" />
          {agingData.map((item) => {
            const dash = total ? (item.percent / total) * circumference : 0;
            const circle = (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                className="sk-aging__segment"
                stroke={item.color}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="sk-aging__center">
          <span>Total</span>
          <strong>{formatRs(totalOutstanding)}</strong>
        </div>
      </div>
      <ul className="sk-aging__legend">
        {agingData.map((item) => (
          <li key={item.label}>
            <span className="sk-aging__dot" style={{ background: item.color }} />
            <div>
              <strong>{item.label}</strong>
              <span>
                {formatRs(item.value)} · {item.percent}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShopkeeperDashboard({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [dashData, setDashData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  const showShopBanner = needsShopSetup(user);
  const shopPending = isShopPendingVerification(user);

  useEffect(() => {
    setDashLoading(true);
    fetchDashboardStats()
      .then(setDashData)
      .catch(() => setDashData(null))
      .finally(() => setDashLoading(false));
  }, []);

  const stats = dashData?.stats;
  const topDue = dashData?.topDueCustomers || [];
  const recentTx = dashData?.recentTransactions || [];
  const agingData = dashData?.agingData || [];
  const dueReminders = dashData?.dueReminders || [];
  const chart = dashData?.chart || { credit: [], payment: [] };

  const formatTrend = (key) => {
    if (!stats || !key) return '';
    const val = stats[key];
    if (key === 'weekCredit' || key === 'weekPayment') return val ? `+${formatRs(val)} this week` : '';
    return '';
  };

  const handleResend = async () => {
    setResending(true);
    setEmailMsg('');
    try {
      const data = await resendVerification();
      setEmailMsg(data.message);
    } catch (err) {
      setEmailMsg(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <ShopkeeperLayout
      user={user}
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen((open) => !open)}
    >
      {shopPending && (
        <div className="sk-banner sk-banner--info">
          <ShieldCheck size={20} />
          <div>
            <strong>Shop verification pending</strong>
            <p>
              Your shop details were submitted and are waiting for admin approval.{' '}
              <Link to="/shop/settings">View profile</Link>
            </p>
          </div>
        </div>
      )}

      {showShopBanner && !shopPending && (
        <div className="sk-banner sk-banner--warn">
          <ShieldCheck size={20} />
          <div>
            <strong>Complete your profile</strong>
            <p>
              Add shop details to get verified.{' '}
              <Link to="/shop/settings">Profile</Link>
            </p>
          </div>
        </div>
      )}

      {!user.isEmailVerified && user.authProvider !== 'google' && (
        <div className="sk-banner sk-banner--info">
          <Mail size={20} />
          <div>
            <strong>Verify your email</strong>
            <p>
              We sent a verification link to <strong>{user.email}</strong>.
            </p>
            {emailMsg && <p className="sk-banner__msg">{emailMsg}</p>}
            <Link to="/verify-email" className="sk-banner__btn" style={{ display: 'inline-flex', marginRight: 8 }}>
              Open email verification
            </Link>
            <button type="button" className="sk-banner__btn" onClick={handleResend} disabled={resending}>
              {resending ? <Loader2 size={14} className="auth-spinner" /> : null}
              Resend verification email
            </button>
          </div>
        </div>
      )}

      {dashLoading ? (
        <div className="sk-panel__empty" style={{ padding: 48 }}>
          <Loader2 size={24} className="auth-spinner" /> Loading dashboard...
        </div>
      ) : (
        <>
          <section className="sk-stats">
            {statCardMeta.map((card) => (
              <article key={card.label} className="sk-stat">
                <div className={`sk-stat__icon ${card.iconBg}`}>
                  <card.icon size={20} />
                </div>
                <div className="sk-stat__body">
                  <span className="sk-stat__label">{card.label}</span>
                  <strong className="sk-stat__value">{stats ? card.format(stats[card.key]) : '—'}</strong>
                  <span className={`sk-stat__trend sk-stat__trend--${card.trendType}`}>{formatTrend(card.trendKey)}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="sk-grid sk-grid--3">
            <article className="sk-panel sk-panel--wide">
              <div className="sk-panel__head">
                <h2>Credit vs Payment Overview</h2>
                <span className="sk-panel__filter">Last 30 days</span>
              </div>
              <div className="sk-chart__legend">
                <span><i className="sk-chart__dot sk-chart__dot--credit" /> Credit (Given)</span>
                <span><i className="sk-chart__dot sk-chart__dot--payment" /> Payment (Received)</span>
              </div>
              <CreditPaymentChart credit={chart.credit} payment={chart.payment} />
              <div className="sk-chart__summary">
                <div>
                  <span>Total Credit</span>
                  <strong>{stats ? formatRs(stats.totalCredit) : '—'}</strong>
                </div>
                <div>
                  <span>Total Payment</span>
                  <strong>{stats ? formatRs(stats.totalPayments) : '—'}</strong>
                </div>
              </div>
            </article>

            <article className="sk-panel">
              <div className="sk-panel__head">
                <h2>Top 5 Due Customers</h2>
                <Link to="/shop/dues" className="sk-panel__link">View All</Link>
              </div>
              {topDue.length ? (
                <ul className="sk-due-list">
                  {topDue.map((customer, index) => (
                    <li key={customer.id || customer.name}>
                      <span className="sk-due-list__rank">{index + 1}</span>
                      <span className="sk-due-list__avatar">{customer.avatar}</span>
                      <div className="sk-due-list__info">
                        <strong>{customer.name}</strong>
                        <span className="sk-due-list__amount">{formatRs(customer.amount)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sk-panel__empty">No customers with outstanding dues.</p>
              )}
            </article>

            <article className="sk-panel">
              <div className="sk-panel__head">
                <h2>Recent Transactions</h2>
                <Link to="/shop/transactions" className="sk-panel__link">View All</Link>
              </div>
              {recentTx.length ? (
                <ul className="sk-tx-list">
                  {recentTx.map((tx) => (
                    <li key={tx.id || `${tx.text}-${tx.time}`}>
                      <span className={`sk-tx-list__icon sk-tx-list__icon--${tx.type}`}>
                        {tx.type === 'credit' ? <Plus size={14} /> : <ArrowDownLeft size={14} />}
                      </span>
                      <div className="sk-tx-list__info">
                        <strong>{tx.text}</strong>
                        <span>{new Date(tx.time).toLocaleString()}</span>
                      </div>
                      <span className={`sk-tx-list__amount sk-tx-list__amount--${tx.type}`}>{tx.amount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sk-panel__empty">No recent activity yet.</p>
              )}
            </article>
          </section>

          <section className="sk-grid sk-grid--3">
            <article className="sk-panel">
              <div className="sk-panel__head">
                <h2>Outstanding Aging</h2>
              </div>
              <AgingDonut agingData={agingData} totalOutstanding={stats?.totalOutstanding || 0} />
            </article>

            <article className="sk-panel">
              <div className="sk-panel__head">
                <h2>Due Reminders</h2>
                <Link to="/shop/reminders" className="sk-panel__link">View All</Link>
              </div>
              {dueReminders.length ? (
                <ul className="sk-reminder-list">
                  {dueReminders.map((item) => (
                    <li key={item.customerId}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatRs(item.amount)} · {item.daysLabel}</span>
                      </div>
                      <Link to={`/shop/reminders/send?customer=${item.customerId}`} className="sk-reminder-list__btn">
                        Send Reminder
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sk-panel__empty">No customers need reminders right now.</p>
              )}
            </article>

            <article className="sk-panel">
              <div className="sk-panel__head">
                <h2>Quick Actions</h2>
              </div>
              <div className="sk-actions">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.to} className={`sk-actions__btn sk-actions__btn--${action.tone}`}>
                    <action.icon size={22} />
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </ShopkeeperLayout>
  );
}

export default ShopkeeperDashboard;
