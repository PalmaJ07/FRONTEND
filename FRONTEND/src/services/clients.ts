import { api } from './api';
import { ApiClient, Client, CreateClientData } from '../types/clients';
import { PaginatedResponse } from '../types/api';

const mapApiClientToClient = (apiClient: ApiClient): Client => ({
  id: apiClient.encrypted_id,
  name: apiClient.nombre,
  phone: apiClient.telefono,
  address: apiClient.direccion,
  personalId: apiClient.id_personal,
});

export const getClientList = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<{
  clients: Client[];
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalClients: number;
}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  if (search) {
    params.append('search', search);
  }

  const response = await api.get<PaginatedResponse<ApiClient>>(
    `/api/user/cliente/index/?${params.toString()}`
  );

  return {
    clients: response.data.users.map(mapApiClientToClient),
    totalPages: response.data.total_pages,
    currentPage: response.data.current_page,
    pageSize: response.data.page_size,
    totalClients: response.data.total_users,
  };
};

export const createClient = async (data: CreateClientData): Promise<void> => {
  await api.post('/api/user/cliente/create/', data);
};

export const updateClient = async (id: string, data: CreateClientData): Promise<void> => {
  await api.patch(`/api/user/cliente/update/${id}/`, data);
};

export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`/api/user/cliente/delete/${id}/`);
};