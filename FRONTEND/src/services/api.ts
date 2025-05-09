import axios from 'axios';

const BASE_URL = 'http://54.174.76.78:8000/';
//const BASE_URL = 'http://127.0.0.1:8000/';

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
