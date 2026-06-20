import { request } from './client';
import type { Customer, Pagination } from '../types';

export const fetchCustomers = (params: Record<string, string | number> = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return request<{
    success: boolean;
    customers: Customer[];
    pagination?: Pagination;
  }>(`/customers${qs ? `?${qs}` : ''}`);
};

export const fetchCustomer = (id: string) =>
  request<{ success: boolean; customer: Customer }>(`/customers/${id}`);

export const fetchCustomerByQr = (qrCode: string) =>
  request<{ success: boolean; customer: Customer }>(`/customers/qr/${qrCode}`);

export const createCustomer = (payload: Partial<Customer>) =>
  request<{ success: boolean; customer: Customer }>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateCustomer = (id: string, payload: Partial<Customer>) =>
  request<{ success: boolean; customer: Customer }>(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteCustomer = (id: string) =>
  request<{ success: boolean; message?: string }>(`/customers/${id}`, {
    method: 'DELETE',
  });
