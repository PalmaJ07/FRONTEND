import { PaginatedResponse } from './api';

export interface ProductDetail {
  id: string;
  producto: number;
  n_producto: string;
  config_unidad_medida: number;
  peso: number;
  config_presentacion_producto: number;
  cantidad_por_presentacion: number | null;
  unidades_por_presentacion: number;
  total_unidades: number | null;
  almacen: number | null;
  precio_venta_presentacion: number;
  precio_venta_unidades: number;
  proveedor: number;
  fecha_expiracion: string | null;
}

export interface ApiProductDetail {
  encrypted_id: string;
  id: number;
  producto: number;
  n_producto: string;
  config_unidad_medida: number;
  peso: number;
  config_presentacion_producto: number;
  cantidad_por_presentacion: number | null;
  unidades_por_presentacion: number;
  total_unidades: number | null;
  almacen: number | null;
  precio_venta_presentacion: number;
  precio_venta_unidades: number;
  proveedor: number;
  fecha_expiracion: string | null;
}

export interface CreateProductDetailData {
  producto: number;
  config_unidad_medida: number;
  peso: number;
  config_presentacion_producto: number;
  unidades_por_presentacion: number;
  precio_venta_presentacion: number;
  precio_venta_unidades: number;
  proveedor: number;
  almacen: number;
}

export interface ProductDetailResponse extends PaginatedResponse<ApiProductDetail> {
  config: ApiProductDetail[];
  total_config: number;
}

export interface ProductDetailEntry {
  id: string;
  producto: number;
  producto_detalle: string;
  config_almacen: number;
  cantidad_por_presentacion: number;
  unidades_por_presentacion: number;
  precio_compra_presentacion: number;
  precio_compra_unidades: number;
  fecha_expiracion: string;
  fecha_ingreso: string;
}

export interface CreateProductDetailEntryData {
  producto: number;
  producto_detalle: string;
  config_almacen: number;
  cantidad_por_presentacion: number;
  unidades_por_presentacion: number;
  precio_compra_presentacion: number;
  precio_compra_unidades: number;
  fecha_expiracion: string;
  fecha_ingreso: string;
}

export interface UpdateProductDetailData {
  cantidad_por_presentacion: string;
  unidades_por_presentacion: string;
  fecha_expiracion: string;
  almacen: number;
}

export interface CreateProductMovementData {//Envio api movimiento.
  producto: string;
  producto_detalle: string;
  config_almacen: string;
  cantidad_por_presentacion: string;
  unidades_por_presentacion: string;
  precio_compra_presentacion: string;
  precio_compra_unidades: string;
  fecha_expiracion: string;
  fecha_ingreso: string;
}

export interface ProductDetailWithPrices extends ProductDetail {
  precio_compra_presentacion?: number;
  precio_compra_unidades?: number;
  fechas_expiracion?: string[];
}

export interface ProductMovement {
  id: string;
  producto_detalle_origen: string;
  producto_detalle_destino: string;
  cantidad_por_presentacion: string;
  unidades_por_presentacion: string;
  precio_compra_presentacion: string;
  precio_compra_unidades: number;
  fecha: string;
  fecha_expiracion: string;
}

export interface CreateProductReturnData {
  producto_detalle: string;
  cantidad_por_presentacion: number;
  unidades_por_presentacion: number;
  fecha: string;
  fecha_expiracion: string;
}

export interface ProductReturn {
  id: string;
  producto_detalle: string;
  cantidad_por_presentacion: number;
  unidades_por_presentacion: number;
  fecha: string;
  fecha_expiracion: string;
}