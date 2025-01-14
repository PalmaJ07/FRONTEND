import { api } from './api';
import { ApiSupplier, Supplier, SupplierFormData, SupplierResponse } from '../types/suppliers';

const mapApiSupplierToSupplier = (apiSupplier: ApiSupplier): Supplier => ({
  id: apiSupplier.encrypted_id,
  supplierName: apiSupplier.nombre_proveedor,
  phone: apiSupplier.telefono,
  manager: apiSupplier.encargado,
  managerPhone: apiSupplier.telefono_encargado,
});

export const supplierService = {
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

    const response = await api.get<SupplierResponse>(
      `/api/config/proveedor/index/?${params.toString()}`
    );

    return {
      items: response.data.config.map(mapApiSupplierToSupplier),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page,
      pageSize: response.data.page_size,
      totalItems: response.data.total_config,
    };
  },

  create: async (data: SupplierFormData): Promise<void> => {
    await api.post('/api/config/proveedor/create/', data);
  },

  update: async (id: string, data: SupplierFormData): Promise<void> => {
    await api.patch(`/api/config/proveedor/update/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/config/proveedor/delete/${id}/`);
  },
};