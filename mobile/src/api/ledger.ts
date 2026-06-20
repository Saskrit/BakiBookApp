import { request } from './client';
import type { Customer, Pagination } from '../types';
import type { LedgerEntry } from './shared';

export const fetchLedger = (customerId: string, page = 1, limit = 500) =>
  request<{
    success: boolean;
    customer: Customer;
    ledger: LedgerEntry[];
    pagination?: Pagination;
  }>(`/ledger/${customerId}?page=${page}&limit=${limit}`);

export const fetchLedgerAll = async (customerId: string) => {
  const res = await fetchLedger(customerId, 1, 5000);
  return res.ledger;
};
