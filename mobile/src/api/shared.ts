import { request } from './client';
import type { Customer, Payment, Transaction } from '../types';

export type LedgerEntry = {
  id: string;
  date?: string;
  time?: string;
  type?: string;
  label?: string;
  desc?: string;
  products?: string;
  items?: string;
  amount?: string;
  balance?: string;
  method?: string;
  receipt?: string;
};

export type SharedAccountResponse = {
  success: boolean;
  customer: Customer;
  shop?: { name?: string; owner?: string; location?: string };
  summary: {
    balance: number;
    totalCredit: number;
    totalPaid: number;
    transactionCount: number;
    paymentCount: number;
  };
  ledger: LedgerEntry[];
  transactions: Transaction[];
  payments: Payment[];
};

export const fetchSharedAccount = (customerId: string) =>
  request<SharedAccountResponse>(`/shared/${customerId}`);
