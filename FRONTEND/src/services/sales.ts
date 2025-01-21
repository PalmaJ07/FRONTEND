import { api } from './api';
import { ProductDetail, ProductSearchResponse } from '../types/sales';

export const searchProducts = async (search?: string): Promise<ProductDetail[]> => {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  
  const response = await api.get<ProductSearchResponse>(`/api/inv/productoDetalle/index/?${params.toString()}`);
  return response.data.config;
};