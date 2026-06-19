import request from './api';

export const fetchLedger = (customerId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/ledger/${customerId}${qs ? `?${qs}` : ''}`);
};

export const fetchOutstanding = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/ledger/outstanding${qs ? `?${qs}` : ''}`);
};

export const fetchOverdue = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/ledger/overdue${qs ? `?${qs}` : ''}`);
};

export const fetchReminders = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/ledger/reminders${qs ? `?${qs}` : ''}`);
};

export const sendReminder = (payload) =>
  request('/ledger/reminders/send', { method: 'POST', body: JSON.stringify(payload) });

export const fetchNotifications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/ledger/notifications${qs ? `?${qs}` : ''}`);
};

export const fetchNotification = (id) => request(`/ledger/notifications/${id}`);

export const fetchUnreadNotificationCount = () => request('/ledger/notifications/unread-count');

export const markAllNotificationsRead = () =>
  request('/ledger/notifications/read-all', { method: 'PATCH' });

export const markNotificationRead = (id) =>
  request(`/ledger/notifications/${id}/read`, { method: 'PATCH' });

export const archiveNotification = (id) =>
  request(`/ledger/notifications/${id}/archive`, { method: 'PATCH' });

export const unarchiveNotification = (id) =>
  request(`/ledger/notifications/${id}/unarchive`, { method: 'PATCH' });

export const deleteNotification = (id) =>
  request(`/ledger/notifications/${id}`, { method: 'DELETE' });
