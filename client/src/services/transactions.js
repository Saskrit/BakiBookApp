import request from './api';

export const fetchTransactions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/transactions${qs ? `?${qs}` : ''}`);
};

export const fetchTransaction = (id) => request(`/transactions/${id}`);

export const createTransaction = (payload) =>
  request('/transactions', { method: 'POST', body: JSON.stringify(payload) });

export const updateTransaction = (id, payload) =>
  request(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

export const deleteTransaction = (id) =>
  request(`/transactions/${id}`, { method: 'DELETE' });
