import request from './api';

export const fetchPortalDashboard = () => request('/portal/dashboard');

export const fetchPortalLedger = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/portal/ledger${qs ? `?${qs}` : ''}`);
};

export const fetchPortalTransactions = () => request('/portal/transactions');

export const fetchPortalPayments = () => request('/portal/payments');

export const fetchPortalDues = () => request('/portal/dues');

export const fetchPortalNotifications = () => request('/portal/notifications');

export const fetchPortalPaymentSubmissions = () => request('/portal/payment-submissions');
