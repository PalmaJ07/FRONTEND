import { api } from './api';
import { ApiStaff, PaginatedResponse } from '../types/api';
import { Staff, CreateStaffData } from '../types/users';

const USER_TYPE_MAP = {
  'Administrador': 2,
  'Inventario': 3,
  'Ventas': 4,
  'Reportes': 5
};

const getUserType = (type: number): string => {
  const types: Record<number, string> = {
    1: 'Root',
    2: 'Administrador',
    3: 'Inventario',
    4: 'Ventas',
    5: 'Reportes'
  };
  return types[type] || 'Desconocido';
};

const mapApiStaffToStaff = (apiStaff: ApiStaff): Staff => ({
  id: apiStaff.encrypted_id,
  name: apiStaff.name,
  id_personal: apiStaff.id_personal,
  phone: apiStaff.phone,
  username: apiStaff.username,
  userType: getUserType(apiStaff.user_type),
  isActive: apiStaff.estado === 1
});

export const getStaffList = async (
  page: number = 1,
  pageSize: number = 10,
  userType?: number,
  status?: number,
  search?: string
): Promise<{
  staff: Staff[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalUsers: number;
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString()
  });

  if (userType) {
    params.append('user_type', userType.toString());
  }

  if (status !== undefined) {
    params.append('estado', status.toString());
  }

  if (search) {
    params.append('search', search);
  }

  const response = await api.get<PaginatedResponse<ApiStaff>>(
    `/api/user/empleado/index/?${params.toString()}`
  );

  return {
    staff: response.data.users.map(mapApiStaffToStaff),
    totalPages: response.data.total_pages,
    currentPage: response.data.current_page,
    pageSize: response.data.page_size,
    totalUsers: response.data.total_users
  };
};
export const deleteStaff = async (id: string): Promise<void> => {
  await api.delete(`/api/user/empleado/delete/${id}/`);
};

export const createStaff = async (data: CreateStaffData): Promise<void> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  await api.post('/api/user/empleado/create/', formData);
};

export const updateStaff = async (encryptedId: string, data: Partial<Staff>): Promise<void> => {
  const formData = new FormData();
  
  // Map the data to the correct format
  const mappedData = {
    ...data,
    // Convert userType string to number if it exists
    user_type: data.userType ? USER_TYPE_MAP[data.userType as keyof typeof USER_TYPE_MAP] : undefined
  };

  Object.entries(mappedData).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert the key from camelCase to snake_case if needed
      const apiKey = key === 'userType' ? 'user_type' : key;
      formData.append(apiKey, value.toString());
    }
  });
  
  await api.patch(`/api/user/empleado/update/${encryptedId}/`, formData);
};

export const toggleStaffStatus = async (encryptedId: string): Promise<void> => {
  await api.patch(`/api/user/empleado/activate/${encryptedId}/`);
};