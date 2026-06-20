/** Parse amounts that may already include currency symbols or grouping. */
export const parseMoneyAmount = (value: number | string | undefined): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null || value === '') return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Nepali Rupee (NPR) — always formatted as Rs. */
export const formatRs = (amount: number | string | undefined) =>
  `Rs. ${parseMoneyAmount(amount).toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;

export const isNewAccount = (createdAt?: string, withinHours = 48) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < withinHours * 60 * 60 * 1000;
};

export const formatDate = (value?: string | Date) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const formatRelativeTime = (value?: string | Date) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
};

export const trendPercent = (current: number, previous: number) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const sumSlice = (values: number[], start: number, end: number) =>
  values.slice(start, end).reduce((total, value) => total + value, 0);

export const AVATAR_COLORS = ['#6A7E3F', '#3B82F6', '#C08552', '#8B5CF6', '#0891B2', '#C45C5C'];

export const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const formatLastTransaction = (creditDate?: string, paymentDate?: string) => {
  const credit = creditDate ? new Date(creditDate).getTime() : 0;
  const payment = paymentDate ? new Date(paymentDate).getTime() : 0;
  const latest = Math.max(credit, payment);
  if (!latest) return 'No activity yet';

  const date = new Date(latest);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;

  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  });
  return `${dateLabel}, ${time}`;
};

export const getTransactionBadge = (
  balance: number,
  creditDate?: string,
  paymentDate?: string
): { label: string; tone: 'paid' | 'credit' } => {
  if (balance <= 0) return { label: 'Paid', tone: 'paid' };
  const credit = creditDate ? new Date(creditDate).getTime() : 0;
  const payment = paymentDate ? new Date(paymentDate).getTime() : 0;
  if (payment > credit) return { label: 'Paid', tone: 'paid' };
  return { label: 'New Credit', tone: 'credit' };
};

export const isOverdueCustomer = (
  balance: number,
  creditDate?: string,
  overdueDays = 30
) => {
  if (balance <= 0) return false;
  const ref = creditDate ? new Date(creditDate).getTime() : 0;
  if (!ref) return false;
  const days = Math.floor((Date.now() - ref) / (1000 * 60 * 60 * 24));
  return days >= overdueDays;
};
