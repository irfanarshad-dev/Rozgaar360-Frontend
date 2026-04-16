import api from './axios';

export const authService = {
  async register(data) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/api/auth/login', data);
    if (response.data.token) {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user._id);
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  logout() {
    api.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  },

  clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) return false;
    
    if (Date.now() > parseInt(expiry)) {
      this.clearTokens();
      return false;
    }
    
    return true;
  },

  checkTokenExpiry() {
    if (typeof window === 'undefined') return;
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (expiry && Date.now() > parseInt(expiry)) {
      this.clearTokens();
      window.location.href = '/login';
    }
  }
};
