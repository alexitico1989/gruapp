import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notificacion {
  id: string;
  tipo: 'SERVICIO_ACEPTADO' | 'ESTADO_ACTUALIZADO' | 'SERVICIO_CANCELADO' | 'SERVICIO_COMPLETADO' | 'RECLAMO_ACTUALIZADO' | 'GENERAL';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  servicioId?: string;
  icono?: string;
  color?: string;
}

interface NotificacionesState {
  notificaciones: Notificacion[];
  noLeidas: number;
  agregarNotificacion: (notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>) => void;
  marcarComoLeida: (id: string) => void;
  marcarTodasComoLeidas: () => void;
  eliminarNotificacion: (id: string) => void;
  limpiarTodas: () => void;
  cargarNotificaciones: () => Promise<void>;
  guardarNotificaciones: () => Promise<void>;
}

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  notificaciones: [],
  noLeidas: 0,

  agregarNotificacion: (notificacion) => {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: Date.now().toString(),
      fecha: new Date(),
      leida: false,
    };

    set((state) => ({
      notificaciones: [nuevaNotificacion, ...state.notificaciones].slice(0, 50), // Máximo 50
      noLeidas: state.noLeidas + 1,
    }));

    get().guardarNotificaciones();
  },

  marcarComoLeida: (id) => {
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
      noLeidas: Math.max(0, state.noLeidas - 1),
    }));

    get().guardarNotificaciones();
  },

  marcarTodasComoLeidas: () => {
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
      noLeidas: 0,
    }));

    get().guardarNotificaciones();
  },

  eliminarNotificacion: (id) => {
    set((state) => {
      const notif = state.notificaciones.find((n) => n.id === id);
      return {
        notificaciones: state.notificaciones.filter((n) => n.id !== id),
        noLeidas: notif && !notif.leida ? state.noLeidas - 1 : state.noLeidas,
      };
    });

    get().guardarNotificaciones();
  },

  limpiarTodas: () => {
    set({ notificaciones: [], noLeidas: 0 });
    get().guardarNotificaciones();
  },

  cargarNotificaciones: async () => {
    try {
      const data = await AsyncStorage.getItem('notificaciones');
      if (data) {
        const notificaciones = JSON.parse(data);
        const noLeidas = notificaciones.filter((n: Notificacion) => !n.leida).length;
        set({ notificaciones, noLeidas });
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  },

  guardarNotificaciones: async () => {
    try {
      const { notificaciones } = get();
      await AsyncStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    } catch (error) {
      console.error('Error guardando notificaciones:', error);
    }
  },
}));