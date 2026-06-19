import request from './api';

export const fetchConversations = () => request('/messages/conversations');

export const fetchUnreadMessageCount = () => request('/messages/unread-count');

export const fetchMessages = (customerId) => request(`/messages/${customerId}`);

export const sendMessage = (customerId, body) =>
  request(`/messages/${customerId}`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const clearChat = (customerId) =>
  request(`/messages/${customerId}/clear`, { method: 'DELETE' });

export const deleteChat = (customerId) =>
  request(`/messages/${customerId}/chat`, { method: 'DELETE' });

export const blockCustomerMessaging = (customerId) =>
  request(`/messages/${customerId}/block`, { method: 'POST' });

export const unblockCustomerMessaging = (customerId) =>
  request(`/messages/${customerId}/unblock`, { method: 'POST' });
