import request from './api';

export const fetchCustomers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/customers${qs ? `?${qs}` : ''}`);
};

export const fetchCustomer = (id) => request(`/customers/${id}`);

export const fetchCustomerByQr = (qrCode) => request(`/customers/qr/${qrCode}`);

export const createCustomer = (payload) =>
  request('/customers', { method: 'POST', body: JSON.stringify(payload) });

export const updateCustomer = (id, payload) =>
  request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

export const deleteCustomer = (id) =>
  request(`/customers/${id}`, { method: 'DELETE' });
