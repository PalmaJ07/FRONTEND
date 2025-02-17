import { api } from './api';
import { 
  ProductDetail, 
  ProductSearchResponse, 
  Sale, 
  ApiSale, 
  SalesResponse,
  SaleDetail,
  ApiSaleDetail,
  SaleDetailsResponse,
  CreateSaleData,
  CreateSaleDetailData
} from '../types/sales';

export const searchProducts = async (search: string, almacenId: number): Promise<ProductDetail[]> => {
  const params = new URLSearchParams({
    page: '1',
    page_size: '100',
    search,
    almacen: almacenId.toString()
  });
  
  const response = await api.get<ProductSearchResponse>(`/api/inv/productoDetalle/index/?${params.toString()}`);
  return response.data.config;
};

const mapApiSaleToSale = (apiSale: ApiSale): Sale => ({
  id: apiSale.encrypted_id,
  rawId: apiSale.id, // Agregamos el ID sin encriptar
  clientName: apiSale.cliente_nombre,
  userId: apiSale.user,
  employeeName: apiSale.empleado_nombre,
  totalWithoutDiscount: apiSale.total_sin_descuento,
  discount: apiSale.descuento,
  isPercentageDiscount: apiSale.descuento_porcentual,
  totalSale: apiSale.total_venta,
  saleDate: apiSale.fecha_venta,
  comment: apiSale.comentario,
  returnComment: apiSale.comentario_devolucion,
  isReturn: apiSale.devolucion,
  isCancelled: apiSale.anulacion
});

const mapApiSaleDetailToSaleDetail = (apiDetail: ApiSaleDetail): SaleDetail => ({
  id: apiDetail.encrypted_id,
  productDetailId: apiDetail.producto_detalle,
  n_producto: apiDetail.n_producto,
  saleId: apiDetail.venta,
  discount: apiDetail.descuento,
  quantity: apiDetail.cantidad,
  isUnits: apiDetail.unidades,
  isPercentageDiscount: apiDetail.descuento_porcentual,
  salePrice: apiDetail.precio_venta
});

export const salesService = {
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

    const response = await api.get<SalesResponse>(
      `/api/ventas/indexVenta/?${params.toString()}`
    );

    return {
      items: response.data.config.map(mapApiSaleToSale),
      totalPages: response.data.total_pages,
      currentPage: response.data.current_page,
      pageSize: response.data.page_size,
      totalItems: response.data.total_config,
    };
  },

  getSaleDetails: async (saleId: number): Promise<SaleDetail[]> => {
    const response = await api.get<SaleDetailsResponse>(
      `/api/ventas/indexDetalleVenta/?venta=${saleId}`
    );
    return response.data.config.map(mapApiSaleDetailToSaleDetail);
  },

  createSale: async (data: CreateSaleData): Promise<{ id: number; encrypted_id: string }> => {
    const response = await api.post('/api/ventas/ventasCreate/', data);
    return {
      id: response.data.id,
      encrypted_id: response.data.encrypted_id
    };
  },

  createSaleDetail: async (data: CreateSaleDetailData): Promise<void> => {
    await api.post('/api/ventas/ventasDetalleCreate/', data);
  },

  createFullSale: async (
    saleData: CreateSaleData, 
    details: Omit<CreateSaleDetailData, 'venta'>[]
  ): Promise<void> => {
    try {
      // 1. Crear la venta principal
      const { id: ventaId } = await salesService.createSale(saleData);

      // 2. Crear cada detalle de la venta
      const detailPromises = details.map(detail =>
        salesService.createSaleDetail({
          ...detail,
          venta: ventaId
        })
      );

      // Esperar a que todos los detalles se creen
      await Promise.all(detailPromises);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }
};