import { api } from './api';
import { Movement, DateRange, ProfitsReport } from '../types/reports';

export const reportsService = {
  getMovements: async (date?: string, dateRange?: { startDate: string; endDate: string }): Promise<Movement[]> => {
    let url = '/api/config/reporteMovimiento/';
    const params = new URLSearchParams();

    if (date) {
      params.append('fecha', date);
    } else if (dateRange) {
      params.append('fecha_inicio', dateRange.startDate);
      params.append('fecha_fin', dateRange.endDate);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await api.get<Movement[]>(url);
    return response.data;
  },

  getProfits: async (date?: string, dateRange?: { startDate: string; endDate: string }): Promise<ProfitsReport> => {
    let url = '/api/config/reporteGanancias/';
    const params = new URLSearchParams();

    if (date) {
      params.append('fecha', date);
    } else if (dateRange) {
      params.append('fecha_inicio', dateRange.startDate);
      params.append('fecha_fin', dateRange.endDate);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await api.get<ProfitsReport>(url);
    return response.data;
  }
};