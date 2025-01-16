export interface ProductDetail {
  id: string;
  producto: number;
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
  producto: number;
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
}

export interface ProductDetailResponse {
  config: ApiProductDetail[];
  total_pages: number;
  current_page: number;
  page_size: number;
  total_config: number;
}