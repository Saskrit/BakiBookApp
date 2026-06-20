import { request } from './client';
import type { DashboardStats } from '../types';

export interface DashboardRecentTransaction {
  id: string;
  type: string;
  text: string;
  amount: string;
  time?: string;
}

export interface DashboardDueReminder {
  customerId: string;
  name: string;
  amount: number;
  daysOverdue?: number;
  daysLabel?: string;
}

export interface DashboardTopDueCustomer {
  id: string;
  name: string;
  amount: number;
  avatar?: string;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  chart: { credit: number[]; payment: number[] };
  dueReminders: DashboardDueReminder[];
  topDueCustomers: DashboardTopDueCustomer[];
  recentTransactions: DashboardRecentTransaction[];
}

export const fetchDashboardStats = () => request<DashboardResponse>('/shop/dashboard');

export const fetchReport = (
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  type = 'summary'
) => request(`/shop/reports?period=${period}&type=${type}`);

export const fetchCompleteReport = (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
  fetchReport(period, 'complete');
