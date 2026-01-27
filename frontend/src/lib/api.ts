import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 Interceptor para agregar token en cada request
api.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().token;

    // Si no hay token en Zustand, revisa el localStorage
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    }

    console.log('%c[API] Enviando token:', 'color: blue;', token); // debug temporal

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('%c[API] 401 Unauthorized - Token inválido o no proporcionado', 'color: red;', error.response?.data);

      // 🚨 Mientras depuras, comentamos el logout automático
      // useAuthStore.getState().logout();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
