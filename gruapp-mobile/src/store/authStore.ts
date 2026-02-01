// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  role: 'CLIENTE' | 'GRUERO';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

async function setOneSignalUserId(user: User) {
  try {
    const { OneSignal } = await import('react-native-onesignal');
    const externalId = `${user.role.toLowerCase()}_${user.id}`;
    OneSignal.login(externalId);
    console.log('✅ OneSignal user ID set:', externalId);
  } catch (e) {
    console.error('❌ OneSignal setUserId error:', e);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAuth: async (user, token) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
    await setOneSignalUserId(user);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const { OneSignal } = await import('react-native-onesignal');
      OneSignal.logout();
    } catch (e) {
      console.error('❌ OneSignal logout error:', e);
    }
    await AsyncStorage.multiRemove(['user', 'token']);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    try {
      const [userStr, token] = await AsyncStorage.multiGet(['user', 'token']);
      if (userStr[1] && token[1]) {
        const user = JSON.parse(userStr[1]);
        await setOneSignalUserId(user);
        set({ user, token: token[1], isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      set({ isLoading: false });
    }
  },
}));