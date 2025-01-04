export interface PaginatedResponse<T> {
  users: T[];
  total_pages: number;
  current_page: number;
  page_size: number;
  total_users: number;
}

export interface ApiStaff {
  encrypted_id: string;
  name: string;
  id_personal: string;
  phone: string;
  username: string;
  user_type: number;
  estado: number;
  created_user: number | null;
  update_user: null;
  deleted_user: null;
}
