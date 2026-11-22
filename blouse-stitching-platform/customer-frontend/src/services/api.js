import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ammaji-backend.onrender.com/api',
});

// Request interceptor to add JWT token from sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {}

      sessionStorage.setItem(
        'logout_reason',
        'You were logged out because you signed in from another device or terminated active sessions.'
      );

      // Notify in-memory context and cross-tab listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:logged_out', {
            detail: error.response?.data?.detail || 'Session expired or logged out from another device.'
          })
        );

        // Only redirect if not already on login or register page
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/register') {
          window.location.href = '/login?reason=session_terminated';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
