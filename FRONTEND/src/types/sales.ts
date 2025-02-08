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

  export interface Sale {
    id: string;
    rawId: number;
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

  // Agregar estas nuevas interfaces
  export interface CreateSaleData {
    cliente?: number | null;        // ID del cliente si existe
    cliente_nombre?: string | null; // Nombre del cliente si es nuevo
    total_sin_descuento: number;    // Subtotal antes de descuentos
    descuento: number;              // Valor del descuento
    descuento_porcentual: boolean;  // true si es porcentaje, false si es monto
    total_venta: number;            // Total final
    fecha_venta: string;           // Fecha de la venta
    comentario?: string | null;     // Comentario opcional
  }

  export interface CreateSaleDetailData {
    producto_detalle: number;      // ID del detalle del producto
    venta: number;                 // ID de la venta (se obtiene de la respuesta de la venta)
    descuento: number;             // Descuento individual del producto
    cantidad: number;              // Cantidad de productos
    unidades: boolean;             // true para unidades, false para presentación
    descuento_porcentual: boolean; // true si es porcentaje, false si es monto
    precio_venta: number;          // Precio de venta del producto
  }