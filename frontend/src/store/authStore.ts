import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { unsubscribeUser } from '../lib/onesignal';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  role: 'CLIENTE' | 'GRUERO';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: async () => {
        const { user } = get();

        try {
          // 🚛 Si es gruero, cambiar a OFFLINE antes de cerrar sesión
          if (user?.role === 'GRUERO') {
            try {
              await api.patch('/gruero/status', { status: 'OFFLINE' });
              console.log('✅ Gruero cambiado a OFFLINE');
            } catch (error) {
              console.error('⚠️ Error cambiando estado a OFFLINE:', error);
              // No bloquear el logout si falla
            }
          }

          // 🔔 Desuscribir de notificaciones push
          try {
            await unsubscribeUser();
            console.log('✅ Usuario desuscrito de notificaciones push');
          } catch (error) {
            console.error('⚠️ Error desuscribiendo de notificaciones:', error);
            // No bloquear el logout si falla
          }

        } catch (error) {
          console.error('❌ Error en proceso de logout:', error);
        } finally {
          // Limpiar datos locales SIEMPRE
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          set({ user: null, token: null, isAuthenticated: false });
          
          // Redirección inmediata a landing
          window.location.href = '/';
        }
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);