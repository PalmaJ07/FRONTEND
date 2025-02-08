import { ProductDetail as InventoryProductDetail } from '../types/inventory';

export interface ProductDetail extends InventoryProductDetail {}

export interface ProductSearchResponse {
  config: ProductDetail[];
  total_pages: number;
  current_page: number;
  page_size: number;
  total_config: number;
}

export interface Sale {
  id: string;
  rawId: number; // Agregamos el ID sin encriptar
  clientName: string;
  userId: number;
  employeeName: string;
  totalWithoutDiscount: number;
  discount: number;
  isPercentageDiscount: boolean;
  totalSale: number;
  saleDate: string;
  comment: string | null;
  returnComment: string | null;
  isReturn: boolean;
  isCancelled: boolean;
}

export interface ApiSale {
  encrypted_id: string;
  id: number;
  cliente: number | null;
  user: number;
  empleado_nombre: string;
  cliente_nombre: string;
  total_sin_descuento: number;
  descuento: number;
  descuento_porcentual: boolean;
  total_venta: number;
  fecha_venta: string;
  comentario: string | null;
  comentario_devolucion: string | null;
  devolucion: boolean;
  anulacion: boolean;
}

export interface SaleDetail {
  id: string;
  productDetailId: number;
  saleId: number;
  discount: number;
  quantity: number;
  isUnits: boolean;
  isPercentageDiscount: boolean;
  salePrice: number;
}

export interface ApiSaleDetail {
  encrypted_id: string;
  id: number;
  producto_detalle: number;
  venta: number;
  descuento: number;
  cantidad: number;
  unidades: boolean;
  descuento_porcentual: boolean;
  precio_venta: number;
}

export interface SalesResponse {
  config: ApiSale[];
  total_pages: number;
  current_page: number;
  page_size: number;
  total_config: number;
}

export interface SaleDetailsResponse {
  config: ApiSaleDetail[];
  total_pages: number;
  current_page: number;
  page_size: number;
  total_config: number;
}