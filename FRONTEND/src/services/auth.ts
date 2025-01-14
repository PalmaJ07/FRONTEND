import { api } from './api';

interface LoginResponse {
  jwt: string;
}

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    console.log('Sending login request with:', { username });
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post<LoginResponse>('/api/user/login/', formData);
    
    console.log('Login response:', response.data);
    
    // Store token and return true if we have a token
    if (response.data?.jwt) {
      localStorage.setItem('jwt', response.data.jwt);
      return true;
    }
    
    throw new Error('No token received in response');
  } catch (error: any) {
    console.error('Login error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/user/logout/');
    localStorage.removeItem('jwt');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};