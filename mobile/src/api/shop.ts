import { request } from './client';
import type { DashboardStats } from '../types';

export const fetchDashboardStats = () =>
  request<{
    success: boolean;
    stats: DashboardStats;
    chart: { credit: number[]; payment: number[] };
    dueReminders: Array<{ customerId: string; name: string; amount: number }>;
    recentTransactions: Array<{ id: string; type: string; text: string; amount: string }>;
  }>('/shop/dashboard');

export const fetchReport = (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
  request(`/shop/reports?period=${period}&type=summary`);

export const fetchCustomerReport = (customerId: string) =>
  request(`/shop/reports?type=customer&customerId=${customerId}`);
