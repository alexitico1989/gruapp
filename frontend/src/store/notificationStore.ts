import { create } from 'zustand';
import api from '../lib/api';

interface Notificacion {
  id: string;
  userId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  data: string | null;
  createdAt: string;
}

interface NotificationStore {
  notificaciones: Notificacion[];
  noLeidas: number;
  loading: boolean;
  
  // Acciones
  fetchNotificaciones: () => Promise<void>;
  fetchContadorNoLeidas: () => Promise<void>;
  marcarLeida: (id: string) => Promise<void>;
  marcarTodasLeidas: () => Promise<void>;
  agregarNotificacion: (notificacion: Notificacion) => void;
  eliminarNotificacion: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notificaciones: [],
  noLeidas: 0,
  loading: false,
  
  // Obtener notificaciones
  fetchNotificaciones: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/notificaciones?limit=20');
      
      if (response.data.success) {
        const noLeidas = response.data.data.filter((n: Notificacion) => !n.leida).length;
        console.log('📥 Notificaciones cargadas:', response.data.data.length, 'No leídas:', noLeidas);
        set({ 
          notificaciones: response.data.data,
          noLeidas,
        });
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  // Obtener contador de no leídas
  fetchContadorNoLeidas: async () => {
    try {
      const response = await api.get('/notificaciones/contador');
      
      if (response.data.success) {
        console.log('🔢 Contador actualizado:', response.data.data.count);
        set({ noLeidas: response.data.data.count });
      }
    } catch (error) {
      console.error('Error al obtener contador:', error);
    }
  },
  
  // Marcar como leída
  marcarLeida: async (id: string) => {
    try {
      const response = await api.put(`/notificaciones/${id}/leida`);
      
      if (response.data.success) {
        const nuevoNoLeidas = Math.max(0, get().noLeidas - 1);
        console.log('✅ Notificación marcada como leída. No leídas:', nuevoNoLeidas);
        set((state) => ({
          notificaciones: state.notificaciones.map((n) =>
            n.id === id ? { ...n, leida: true } : n
          ),
          noLeidas: nuevoNoLeidas,
        }));
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  },
  
  // Marcar todas como leídas
  marcarTodasLeidas: async () => {
    try {
      const response = await api.put('/notificaciones/marcar-todas-leidas');
      
      if (response.data.success) {
        console.log('✅ Todas las notificaciones marcadas como leídas');
        set((state) => ({
          notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
          noLeidas: 0,
        }));
      }
    } catch (error) {
      console.error('Error al marcar todas:', error);
    }
  },
  
  // Agregar notificación (desde Socket.IO)
  agregarNotificacion: (notificacion: Notificacion) => {
    const estadoActual = get();
    const nuevoNoLeidas = estadoActual.noLeidas + 1;
    
    console.log('🔔 AGREGANDO NOTIFICACIÓN');
    console.log('📊 No leídas ANTES:', estadoActual.noLeidas);
    console.log('📊 No leídas DESPUÉS:', nuevoNoLeidas);
    console.log('📝 Notificación:', notificacion);
    
    set((state) => ({
      notificaciones: [notificacion, ...state.notificaciones],
      noLeidas: nuevoNoLeidas,
    }));
    
    // Verificar que se actualizó
    setTimeout(() => {
      const nuevoEstado = get();
      console.log('✅ Estado actualizado. No leídas ahora:', nuevoEstado.noLeidas);
    }, 100);
  },
  
  // Eliminar notificación
  eliminarNotificacion: async (id: string) => {
    try {
      const response = await api.delete(`/notificaciones/${id}`);
      
      if (response.data.success) {
        set((state) => {
          const notificacion = state.notificaciones.find((n) => n.id === id);
          const noLeidaEliminada = notificacion && !notificacion.leida;
          const nuevoNoLeidas = noLeidaEliminada ? Math.max(0, state.noLeidas - 1) : state.noLeidas;
          
          console.log('🗑️ Notificación eliminada. No leídas:', nuevoNoLeidas);
          
          return {
            notificaciones: state.notificaciones.filter((n) => n.id !== id),
            noLeidas: nuevoNoLeidas,
          };
        });
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  },
}));