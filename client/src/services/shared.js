import request from './api';

export const fetchSharedCredits = (customerId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/shared/${customerId}${qs ? `?${qs}` : ''}`);
};
