import request from './api';

export const fetchDashboardStats = () => request('/shop/dashboard');

export const fetchReport = (periodOrOptions = 'daily') => {
  const options =
    typeof periodOrOptions === 'string'
      ? { period: periodOrOptions }
      : periodOrOptions;

  const params = new URLSearchParams({
    period: options.period || 'daily',
    type: options.type || 'summary',
  });

  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);

  return request(`/shop/reports?${params}`);
};

export const fetchAnalytics = () => request('/shop/analytics');

export const fetchShopActivity = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/shop/activity${qs ? `?${qs}` : ''}`);
};
