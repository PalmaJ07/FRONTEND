export interface Product {
    id: string;
    categoryId: number;
    brandId: number;
    description: string;
    code: string;
  }
  
  export interface ApiProduct {
    encrypted_id: string;
    config_categoria: number;
    config_marca: number;
    descripcion: string;
    codigo: string;
    created_user: number | null;
    update_user: number | null;
    deleted_user: number | null;
    created_at: string;
    update_at: string;
    deleted_at: string | null;
  }
  
  export interface ProductFormData {
    config_categoria: number;
    config_marca: number;
    descripcion: string;
    codigo: string;
  }
  
  export interface ProductResponse {
    config: ApiProduct[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }