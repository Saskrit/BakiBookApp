import { request } from './client';

export const fetchPortalDashboard = () =>
  request<{
    success: boolean;
    summary: {
      currentDue: number;
      totalPurchases: number;
      totalPaid: number;
      lastPayment: string | null;
    };
    shops: Array<{ shopName: string; balance: number }>;
  }>('/portal/dashboard');

export const fetchPortalLedger = () =>
  request<{ success: boolean; ledger: Array<Record<string, unknown>> }>('/portal/ledger');

export const fetchPortalPayments = () =>
  request<{ success: boolean; payments: Array<Record<string, unknown>> }>('/portal/payments');

export const fetchPendingLinks = () =>
  request<{
    success: boolean;
    count: number;
    invitations: Array<Record<string, unknown>>;
  }>('/links/pending');

export const acceptShopLink = (customerId: string) =>
  request(`/links/${customerId}/accept`, { method: 'POST' });

export const rejectShopLink = (customerId: string) =>
  request(`/links/${customerId}/reject`, { method: 'POST' });
