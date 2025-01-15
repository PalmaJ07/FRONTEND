import { api } from './api';
import { Category, CategoryResponse } from '../types/categories';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<CategoryResponse>('/api/config/categoria/index/');
    return response.data.config.map(item => ({
      id: parseInt(atob(item.encrypted_id)), // Decodificamos el ID base64
      name: item.nombre
    }));
  }
};