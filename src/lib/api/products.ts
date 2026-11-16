import { apiClient } from './client';
import type {
  Product,
  ProductFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const productsApi = {
  /**
   * List products with filtering and pagination
   */
  list: (filters?: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>('/api/products', filters as Record<string, unknown>),

  /**
   * Get product by ID
   */
  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/api/products/${id}`),

  /**
   * Get product by SKU
   */
  getBySku: (sku: string) =>
    apiClient.get<ApiResponse<Product>>(`/api/products/sku/${sku}`),

  /**
   * Upload product image (admin)
   */
  uploadImage: (id: string, file: File) =>
    apiClient.upload<ApiResponse<{ imageUrl: string }>>(`/api/products/${id}/images`, file, 'image'),

  /**
   * Delete product image (admin)
   */
  deleteImage: (id: string) =>
    apiClient.delete<void>(`/api/products/${id}/images`),
};
