import axios from 'axios';

// In local dev, Vite's proxy (vite.config.js) forwards '/api' to the backend.
// In a static production deployment (e.g. Vercel) there's no dev proxy, so
// VITE_API_BASE_URL can point directly at the deployed backend's /api URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sot_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handling: if the token is invalid/expired, clear it and
// let the app redirect to login via AuthContext's state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sot_token');
      localStorage.removeItem('sot_user');
    }
    return Promise.reject(err);
  }
);

export default api;
