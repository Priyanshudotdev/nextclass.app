import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on auth pages
      const authPaths = ['/login', '/register', '/forgot-password'];
      if (
        !authPaths.some((path) => window.location.pathname.startsWith(path))
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
