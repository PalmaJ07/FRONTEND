export interface Movement {
    producto: string;
    producto_detalle_origen: string;
    producto_detalle_destino: string;
    cantidad_por_presentacion: number;
    unidades_por_presentacion: number;
    fecha: string;
    fecha_expiracion: string;
  }
  
  export interface DateRange {
    startDate: string;
    endDate: string;
  }

  export interface ProfitSale {
    id: number;
    cliente: {
      encrypted_id: string;
      id: number;
      nombre: string;
      telefono: string;
      direccion: string;
      id_personal: string;
      created_user: number;
      update_user: number | null;
      deleted_user: number | null;
    };
    total_venta: number;
    fecha_venta: string;
  }
  
  export interface ProfitsReport {
    ganancias: number;
    total_ventas: number;
    total_costos: number;
    ventas: ProfitSale[];
  }