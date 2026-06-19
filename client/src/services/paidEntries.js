import request from './api';

export const archivePaidEntry = (paymentId) =>
  request(`/paid-entries/${paymentId}/archive`, { method: 'PATCH' });

export const unarchivePaidEntry = (paymentId) =>
  request(`/paid-entries/${paymentId}/unarchive`, { method: 'PATCH' });

export const hidePaidEntry = (paymentId) =>
  request(`/paid-entries/${paymentId}/hide`, { method: 'PATCH' });

export const restorePaidEntry = (paymentId) =>
  request(`/paid-entries/${paymentId}/restore`, { method: 'PATCH' });
