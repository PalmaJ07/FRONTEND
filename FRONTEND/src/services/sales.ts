import { api } from './api';
import { ProductDetail, ProductSearchResponse } from '../types/sales';

export const searchProducts = async (search: string, almacenId: number): Promise<ProductDetail[]> => {
  const params = new URLSearchParams({
    page: '1',
    page_size: '100',
    search,
    almacen: almacenId.toString()
  });
  
  const response = await api.get<ProductSearchResponse>(`/api/inv/productoDetalle/index/?${params.toString()}`);
  return response.data.config;
};