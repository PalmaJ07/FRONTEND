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