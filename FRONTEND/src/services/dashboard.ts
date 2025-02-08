import { api } from './api';
import { TopProduct, TopUser } from '../types/dashboard';

export const dashboardService = {
  getTopProducts: async (): Promise<TopProduct[]> => {
    const response = await api.get<TopProduct[]>('/api/config/dashboardproducto/');
    return response.data;
  },

  getTopUsers: async (): Promise<TopUser[]> => {
    const response = await api.get<TopUser[]>('/api/config/dashboardusuarios/');
    return response.data;
  }
};