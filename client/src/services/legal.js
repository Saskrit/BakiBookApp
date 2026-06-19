import request from './api';

export const fetchLegalDocuments = () => request('/legal');

export const fetchLegalDocument = (slug) => request(`/legal/${slug}`);

export const updateLegalDocument = (slug, payload) =>
  request(`/legal/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const formatLegalDate = (dateValue) => {
  if (!dateValue) return '—';
  return new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
