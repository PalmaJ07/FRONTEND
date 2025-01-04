export interface ConfigItem {
    id: string;
    name: string;
    abbreviation: string;
    order: number;
  }
  
  export interface ApiConfigItem {
    encrypted_id: string;
    nombre: string;
    abreviatura: string;
    orden: number;
    created_user: number | null;
    update_user: number | null;
    deleted_user: number | null;
    created_at: string;
    update_at: string;
    deleted_at: string | null;
  }
  
  export interface ConfigFormData {
    nombre: string;
    abreviatura: string;
    orden: number;
  }
  
  export interface ConfigResponse {
    config: ApiConfigItem[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }