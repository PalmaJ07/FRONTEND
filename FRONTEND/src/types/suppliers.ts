export interface Supplier {
    id: string;
    supplierName: string;
    phone: string;
    manager: string;
    managerPhone: string;
  }
  
  export interface ApiSupplier {
    encrypted_id: string;
    nombre_proveedor: string;
    telefono: string;
    encargado: string;
    telefono_encargado: string;
    created_user: number | null;
    update_user: number | null;
    deleted_user: number | null;
    created_at: string;
    update_at: string;
    deleted_at: string | null;
  }
  
  export interface SupplierFormData {
    nombre_proveedor: string;
    telefono: string;
    encargado: string;
    telefono_encargado: string;
  }
  
  export interface SupplierResponse {
    config: ApiSupplier[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }