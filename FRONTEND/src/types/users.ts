export type UserType = 'Root' | 'Administrador' | 'Inventario' | 'Ventas' | 'Reportes';

export interface Staff {
  id: string;
  name: string;
  id_personal: string;
  phone: string;
  username: string;
  userType: UserType;
  isActive: boolean;
  almacen_asignado: string | null;
}

export interface CreateStaffData {
  name: string;
  id_personal: string;
  phone: string;
  username: string;
  password: string;
  user_type: number;
  estado: number;
  almacen_asignado: string | null;
}

export interface UserProfile {
  nombre: string;
  username: string;
  telefono: string;
  id_personal: string;
  user_type: string;
  almacen_asignado: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  identityCard: string;
}