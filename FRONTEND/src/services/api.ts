import axios from 'axios';

const BASE_URL = 'http://3.86.88.191:8000';

export const api = axios.create({
  baseURL: BASE_URL,
});

// Add JWT to all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});