import { api } from './api';
import { Brand, BrandResponse } from '../types/brands';

export const brandService = {
  getAll: async (): Promise<Brand[]> => {
    const response = await api.get<BrandResponse>('/api/config/marca/index/');
    return response.data.config.map(item => ({
      id: parseInt(atob(item.encrypted_id)), // Decodificamos el ID base64
      name: item.nombre
    }));
  }
};