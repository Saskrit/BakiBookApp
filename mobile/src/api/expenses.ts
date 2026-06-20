import { request } from './client';
import type { ShopExpense } from '../types';

export const fetchExpenses = (params: { category?: string; month?: string } = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();

  return request<{
    success: boolean;
    expenses: ShopExpense[];
    total: number;
    categories: string[];
  }>(`/expenses${qs ? `?${qs}` : ''}`);
};

export const createExpense = (payload: {
  title: string;
  amount: number;
  category?: string;
  note?: string;
  expenseDate?: string;
}) =>
  request<{ success: boolean; expense: ShopExpense }>('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateExpense = (
  id: string,
  payload: Partial<{
    title: string;
    amount: number;
    category: string;
    note: string;
    expenseDate: string;
  }>
) =>
  request<{ success: boolean; expense: ShopExpense }>(`/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteExpense = (id: string) =>
  request<{ success: boolean; message?: string }>(`/expenses/${id}`, {
    method: 'DELETE',
  });
