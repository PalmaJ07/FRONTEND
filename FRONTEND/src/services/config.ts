import { api } from './api';
import { ApiConfigItem, ConfigItem, ConfigFormData, ConfigResponse } from '../types/config';

const mapApiConfigToConfig = (apiConfig: ApiConfigItem): ConfigItem => ({
  id: apiConfig.encrypted_id,
  name: apiConfig.nombre,
  abbreviation: apiConfig.abreviatura,
  order: apiConfig.orden,
});

export const createConfigService = (endpoint: string) => {
  const baseUrl = `/api/config/${endpoint}`;

  return {
    getList: async (
      page: number = 1,
      pageSize: number = 10,
      search?: string
    ) => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get<ConfigResponse>(`${baseUrl}/index/?${params.toString()}`);

      return {
        items: response.data.config.map(mapApiConfigToConfig),
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        pageSize: response.data.page_size,
        totalItems: response.data.total_config,
      };
    },

    create: async (data: ConfigFormData): Promise<void> => {
      await api.post(`${baseUrl}/create/`, data);
    },

    update: async (id: string, data: ConfigFormData): Promise<void> => {
      await api.patch(`${baseUrl}/update/${id}/`, data);
    },

    delete: async (id: string): Promise<void> => {
      await api.delete(`${baseUrl}/delete/${id}/`);
    },
  };
};