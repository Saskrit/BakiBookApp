import { request } from './client';

export const fetchLedger = (customerId: string) =>
  request<{ success: boolean; entries: Array<Record<string, unknown>> }>(
    `/ledger/${customerId}`
  );
