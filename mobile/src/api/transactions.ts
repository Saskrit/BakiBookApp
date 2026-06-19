import { request } from './client';
import type { LineItem, Payment, Transaction } from '../types';

export const fetchTransactions = (customerId?: string) => {
  const qs = customerId ? `?customerId=${customerId}` : '';
  return request<{ success: boolean; transactions: Transaction[] }>(`/transactions${qs}`);
};

export const createTransaction = (payload: {
  customerId: string;
  items: LineItem[];
  note?: string;
}) =>
  request('/transactions', { method: 'POST', body: JSON.stringify(payload) });

export const fetchPayments = (customerId?: string) => {
  const qs = customerId ? `?customerId=${customerId}` : '';
  return request<{ success: boolean; payments: Payment[] }>(`/payments${qs}`);
};

export const createPayment = (payload: {
  customerId: string;
  amount: number;
  method?: string;
  note?: string;
}) =>
  request('/payments', { method: 'POST', body: JSON.stringify(payload) });
