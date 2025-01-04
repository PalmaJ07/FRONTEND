import { api } from './api';
import { UserProfile } from '../types/users';

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/api/user/empleado/profile/');
  return response.data;
};