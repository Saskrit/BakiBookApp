import request from './api';

export const fetchPayments = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/payments${qs ? `?${qs}` : ''}`);
};

export const fetchPayment = (id) => request(`/payments/${id}`);

export const createPayment = (payload) =>
  request('/payments', { method: 'POST', body: JSON.stringify(payload) });

export const deletePayment = (id) =>
  request(`/payments/${id}`, { method: 'DELETE' });
