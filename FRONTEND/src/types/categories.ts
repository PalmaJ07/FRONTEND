export interface Category {
    id: number;
    name: string;
  }
  
  export interface CategoryResponse {
    config: {
      encrypted_id: number;
      nombre: string;
    }[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }