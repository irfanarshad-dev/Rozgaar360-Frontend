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
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const url = error.config?.url || 'unknown-endpoint';

    // 401/403 are expected during auth checks on protected screens.
    // Avoid noisy Console Error spam for these cases.
    if (status !== 401 && status !== 403) {
      console.error(`API ${status || 'Network'} Error (${url}):`, message);
    }

    // Do not force global redirects here. Route-level guards decide how to handle 401
    // to avoid redirect loops when only part of a page's requests fail.
    return Promise.reject(error);
  }
);

export default api;