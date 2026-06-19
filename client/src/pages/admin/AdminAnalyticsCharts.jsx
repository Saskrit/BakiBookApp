import { formatRs } from '../../utils/format';
import './AdminAnalytics.css';

function buildLinePath(values, width, height, padding = 12) {
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

function formatCompact(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function AdminTrendChart({ credit = [], payment = [], labels = [] }) {
  const w = 560;
  const h = 200;
  const creditPath = buildLinePath(credit, w, h);
  const paymentPath = buildLinePath(payment, w, h);
  const hasData = credit.some((v) => v > 0) || payment.some((v) => v > 0);

  if (!hasData) {
    return <p className="admin-chart-empty">No credit or payment activity in the last 6 months.</p>;
  }

  const creditTotal = credit.reduce((s, v) => s + v, 0);
  const paymentTotal = payment.reduce((s, v) => s + v, 0);

  return (
    <div className="admin-trend-chart">
      <div className="admin-chart-legend">
        <span><i className="admin-chart-dot admin-chart-dot--credit" /> Credit issued</span>
        <span><i className="admin-chart-dot admin-chart-dot--payment" /> Payments collected</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="admin-chart-svg" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="12"
            y1={12 + (i * (h - 24)) / 4}
            x2={w - 12}
            y2={12 + (i * (h - 24)) / 4}
            className="admin-chart-grid"
          />
        ))}
        {creditPath && <polyline points={creditPath} className="admin-chart-line admin-chart-line--credit" />}
        {paymentPath && <polyline points={paymentPath} className="admin-chart-line admin-chart-line--payment" />}
      </svg>
      {labels.length > 0 && (
        <div className="admin-chart-labels">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
      <div className="admin-chart-summary">
        <div><span>Total credit</span><strong>{formatRs(creditTotal)}</strong></div>
        <div><span>Total payments</span><strong>{formatRs(paymentTotal)}</strong></div>
      </div>
    </div>
  );
}

export function AdminBarChart({ data = [], labels = [], color = '#9A6B42' }) {
  const max = Math.max(...data, 1);

  if (!data.some((v) => v > 0)) {
    return <p className="admin-chart-empty">No data for this period.</p>;
  }

  return (
    <div className="admin-bar-chart">
      <div className="admin-bar-chart__bars">
        {data.map((value, i) => (
          <div key={labels[i] || i} className="admin-bar-chart__col">
            <span className="admin-bar-chart__value">{formatCompact(value)}</span>
            <div className="admin-bar-chart__track">
              <div
                className="admin-bar-chart__fill"
                style={{ height: `${Math.max(4, (value / max) * 100)}%`, background: color }}
              />
            </div>
            <span className="admin-bar-chart__label">{labels[i] || ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDonutChart({ segments = [], centerLabel, centerValue }) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!total) {
    return <p className="admin-chart-empty">No data available.</p>;
  }

  return (
    <div className="admin-donut">
      <div className="admin-donut__wrap">
        <svg viewBox="0 0 140 140" className="admin-donut__svg">
          <circle cx="70" cy="70" r={radius} className="admin-donut__track" />
          {segments.map((item) => {
            const dash = (item.value / total) * circumference;
            const circle = (
              <circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                className="admin-donut__segment"
                stroke={item.color}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="admin-donut__center">
          <strong>{centerValue ?? total}</strong>
          <span>{centerLabel || 'Total'}</span>
        </div>
      </div>
      <ul className="admin-donut__legend">
        {segments.map((item) => (
          <li key={item.label}>
            <i style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminTopShopsList({ shops = [] }) {
  if (!shops.length) {
    return <p className="admin-chart-empty">No shop data yet.</p>;
  }

  const maxOutstanding = Math.max(...shops.map((s) => s.outstanding), 1);

  return (
    <ul className="admin-top-shops">
      {shops.map((shop, index) => (
        <li key={shop.name + index}>
          <span className="admin-top-shops__rank">{index + 1}</span>
          <div className="admin-top-shops__info">
            <strong>{shop.name}</strong>
            <span>{shop.customers} customer{shop.customers !== 1 ? 's' : ''}</span>
            <div className="admin-top-shops__bar">
              <div
                className="admin-top-shops__fill"
                style={{ width: `${(shop.outstanding / maxOutstanding) * 100}%` }}
              />
            </div>
          </div>
          <strong className="admin-top-shops__amount">{formatRs(shop.outstanding)}</strong>
        </li>
      ))}
    </ul>
  );
}
