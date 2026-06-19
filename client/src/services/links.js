import request from './api';

export const fetchPendingLinks = () => request('/links/pending');

export const fetchPendingLinkDetail = (customerId) => request(`/links/pending/${customerId}`);

export const fetchLinkedShops = () => request('/links/linked');

export const acceptShopLink = (customerId) =>
  request(`/links/${customerId}/accept`, { method: 'POST' });

export const rejectShopLink = (customerId) =>
  request(`/links/${customerId}/reject`, { method: 'POST' });
