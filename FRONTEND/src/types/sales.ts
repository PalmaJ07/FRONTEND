export interface ProductDetail {
    encrypted_id: string;
    id: number;
    producto: number;
    n_producto: string;
    config_unidad_medida: number;
    peso: number;
    config_presentacion_producto: number;
    cantidad_por_presentacion: number;
    unidades_por_presentacion: number;
    total_unidades: number;
    almacen: number;
    precio_venta_presentacion: string;
    precio_venta_unidades: string;
    proveedor: number;
    fecha_expiracion: string;
    created_user: number | null;
    update_user: number | null;
    deleted_user: null;
    created_at: string;
    update_at: string;
    deleted_at: null;
  }
  
  export interface ProductSearchResponse {
    config: ProductDetail[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }