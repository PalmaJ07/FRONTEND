export interface TopProduct {
    producto_detalle__id: number;
    producto_detalle__producto__descripcion: string;
    total_vendido: number;
  }
  
  export interface TopUser {
    user__id: number;
    user__name: string;
    total_ventas: number;
  }
  
  export interface DashboardData {
    topProducts: TopProduct[];
    topUsers: TopUser[];
  }