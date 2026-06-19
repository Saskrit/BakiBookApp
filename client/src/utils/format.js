export const formatRs = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-NP')}`;

export const creditScoreClass = (score) => {
  const map = {
    Excellent: 'app-badge--success',
    Good: 'app-badge--info',
    Average: 'app-badge--warn',
    Risky: 'app-badge--danger',
    Defaulter: 'app-badge--danger',
  };
  return map[score] || 'app-badge--muted';
};
