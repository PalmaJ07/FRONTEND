export interface Brand {
    id: string;
    name: string;
  }
  
  export interface BrandResponse {
    config: {
      encrypted_id: string;
      nombre: string;
    }[];
    total_pages: number;
    current_page: number;
    page_size: number;
    total_config: number;
  }