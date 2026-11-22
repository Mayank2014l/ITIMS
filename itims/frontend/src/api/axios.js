// One Axios instance for all API calls.
// - adds the JWT token to every request
// - logs the user out automatically if the token is invalid (401)
import axios from 'axios';
import { isDemoMode } from '../config';
import demoAdapter from './demoApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ...(isDemoMode ? { adapter: demoAdapter } : {}),
});

api.interceptors.request.use((config) => {
  if (isDemoMode) return config;
  const token = localStorage.getItem('itims_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('itims_token');
      localStorage.removeItem('itims_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Get the friendly message from our { success, data, message } error format
export const errMsg = (err) => err.response?.data?.message || err.message || 'Something went wrong';

export default api;
