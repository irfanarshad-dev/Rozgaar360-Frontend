import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type for FormData (multipart/form-data)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`API ${error.response?.status || 'Network'} Error:`, error.response?.data?.message || error.message);
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('userId');
      // Redirect admin routes to admin login, others to regular login
      const isAdminPath = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default api;