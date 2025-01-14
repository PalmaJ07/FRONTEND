import { api } from './api';
import { Brand, BrandResponse } from '../types/brands';

export const brandService = {
  getAll: async (): Promise<Brand[]> => {
    const response = await api.get<BrandResponse>('/api/config/marca/index/');
    return response.data.config.map(item => ({
      id: item.encrypted_id,
      name: item.nombre
    }));
  }
};