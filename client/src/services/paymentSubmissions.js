import request from './api';

export const fetchCustomerSubmissions = () => request('/portal/payment-submissions');

export const submitCustomerPayment = (payload) =>
  request('/portal/payment-submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchShopkeeperSubmissions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/payment-submissions${qs ? `?${qs}` : ''}`);
};

export const fetchPendingSubmissionCount = () => request('/payment-submissions/pending-count');

export const fetchShopkeeperSubmission = (id) => request(`/payment-submissions/${id}`);

export const acceptPaymentSubmission = (id, payload = {}) =>
  request(`/payment-submissions/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const rejectPaymentSubmission = (id, payload) =>
  request(`/payment-submissions/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const reportPaymentSubmission = (id, payload) =>
  request(`/payment-submissions/${id}/report`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
