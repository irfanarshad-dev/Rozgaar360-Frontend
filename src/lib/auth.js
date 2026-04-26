import api from './axios';

export const authService = {
  async register(data) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/api/auth/login', data);
    
    if (response.data.token) {
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tokenExpiry', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('userId', response.data.user._id);
      
      if (typeof document !== 'undefined') {
        document.cookie = `token=${response.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  logout() {
    api.post('/api/auth/logout').catch(() => {});
    const currentUser = this.getUser();
    this.clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = currentUser?.role === 'admin' ? '/admin/login' : '/login';
    }
  },

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      // Clear cookie
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
    }
  },

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (!user) return null;

      try {
        return JSON.parse(user);
      } catch {
        // Corrupt user payload should not crash protected route checks.
        this.clearTokens();
        return null;
      }
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
    if (typeof window === 'undefined') return false;
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (expiry && Date.now() > parseInt(expiry)) {
      return true; // Token expired, let caller handle redirect
    }
    return false;
  }
};
