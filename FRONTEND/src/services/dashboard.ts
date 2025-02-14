import { api } from './api';
import { TopProduct, TopUser, DailyProfits } from '../types/dashboard';
import { format } from 'date-fns';

export const dashboardService = {
  getTopProducts: async (): Promise<TopProduct[]> => {
    const response = await api.get<TopProduct[]>('/api/config/dashboardproducto/');
    return response.data;
  },

  getTopUsers: async (): Promise<TopUser[]> => {
    const response = await api.get<TopUser[]>('/api/config/dashboardusuarios/');
    return response.data;
  },

  getDailyProfits: async (): Promise<DailyProfits> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const response = await api.get<DailyProfits>(`/api/config/dashboardganancia/?fecha=${today}`);
    return response.data;
  }
};