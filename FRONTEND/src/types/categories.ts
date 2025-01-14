export interface Category {
    id: string;
    name: string;
  }
  
  export interface CategoryResponse {
    config: {
      encrypted_id: string;
      nombre: string;
    }[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }