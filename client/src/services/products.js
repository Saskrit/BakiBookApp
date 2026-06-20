import request from './api';

export const fetchProducts = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();

  return request(`/shop/products${qs ? `?${qs}` : ''}`);
};
