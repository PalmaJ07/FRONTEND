import { api } from './api';
import { ApiProduct, Product, ProductFormData, ProductResponse } from '../types/products';

const mapApiProductToProduct = (apiProduct: ApiProduct): Product => ({
  id: apiProduct.encrypted_id,
  categoryId: apiProduct.config_categoria,
  brandId: apiProduct.config_marca,
  description: apiProduct.descripcion,
  code: apiProduct.codigo,
});

export const productService = {
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

    const response = await api.get<ProductResponse>(
      `/api/inv/producto/index/?${params.toString()}`
    );

    return {
      items: response.data.config.map(mapApiProductToProduct),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page,
      pageSize: response.data.page_size,
      totalItems: response.data.total_config,
    };
  },

  create: async (data: ProductFormData): Promise<void> => {
    await api.post('/api/inv/producto/create/', data);
  },

  update: async (id: string, data: ProductFormData): Promise<void> => {
    await api.patch(`/api/inv/producto/update/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/inv/producto/delete/${id}/`);
  },
};