import { request } from './client';
import type { ShopProduct } from '../types';

export const fetchProducts = (params: { search?: string; limit?: number; all?: boolean } = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => [key, key === 'all' ? 'true' : String(value)])
  ).toString();

  return request<{ success: boolean; products: ShopProduct[]; total: number }>(
    `/shop/products${qs ? `?${qs}` : ''}`
  );
};

export const createProduct = (payload: { name: string; lastPrice?: number }) =>
  request<{ success: boolean; product: ShopProduct }>('/shop/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateProduct = (id: string, payload: { name?: string; lastPrice?: number }) =>
  request<{ success: boolean; product: ShopProduct }>(`/shop/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteProduct = (id: string) =>
  request<{ success: boolean; message?: string }>(`/shop/products/${id}`, {
    method: 'DELETE',
  });
