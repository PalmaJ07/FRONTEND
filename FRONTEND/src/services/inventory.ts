import { api } from './api';
import { 
  ApiProductDetail, 
  ProductDetail, 
  CreateProductDetailData, 
  ProductDetailResponse 
} from '../types/inventory';

const mapApiProductDetailToProductDetail = (apiDetail: ApiProductDetail): ProductDetail => ({
  id: apiDetail.encrypted_id,
  producto: apiDetail.producto,
  config_unidad_medida: apiDetail.config_unidad_medida,
  peso: apiDetail.peso,
  config_presentacion_producto: apiDetail.config_presentacion_producto,
  cantidad_por_presentacion: apiDetail.cantidad_por_presentacion,
  unidades_por_presentacion: apiDetail.unidades_por_presentacion,
  total_unidades: apiDetail.total_unidades,
  almacen: apiDetail.almacen,
  precio_venta_presentacion: apiDetail.precio_venta_presentacion,
  precio_venta_unidades: apiDetail.precio_venta_unidades,
  proveedor: apiDetail.proveedor,
  fecha_expiracion: apiDetail.fecha_expiracion,
});

export const inventoryService = {
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

    const response = await api.get<ProductDetailResponse>(
      `/api/inv/productoDetalle/index/?${params.toString()}`
    );

    return {
      items: response.data.config.map(mapApiProductDetailToProductDetail),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page,
      pageSize: response.data.page_size,
      totalItems: response.data.total_config,
    };
  },

  create: async (data: CreateProductDetailData): Promise<void> => {
    await api.post('/api/inv/productoDetalle/create/', data);
  },

  update: async (id: string, data: Partial<CreateProductDetailData>): Promise<void> => {
    await api.patch(`/api/inv/productoDetalle/update/${id}/`, data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/inv/productoDetalle/delete/${id}/`);
  },
};