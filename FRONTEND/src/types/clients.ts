export interface ApiClient {
    encrypted_id: string;
    nombre: string;
    telefono: string;
    direccion: string;
    id_personal: string;
    created_user: number | null;
    update_user: number | null;
    deleted_user: number | null;
  }
  
  export interface Client {
    id: string;
    name: string;
    phone: string;
    address: string;
    personalId: string;
  }
  
  export interface CreateClientData {
    nombre: string;
    telefono: string;
    direccion: string;
    id_personal: string;
  }