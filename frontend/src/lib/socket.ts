import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión socket:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Eventos de gruero
  joinGruero(grueroId: string, lat: number, lng: number) {
    this.socket?.emit('gruero:join', { grueroId, lat, lng });
  }

  updateGrueroLocation(grueroId: string, lat: number, lng: number) {
    this.socket?.emit('gruero:location', { grueroId, lat, lng });
  }

  // Eventos de cliente
  joinServicio(servicioId: string) {
    this.socket?.emit('cliente:join', { servicioId });
  }

  // Eventos de servicio
  notifyNuevoServicio(servicioId: string, lat: number, lng: number) {
    this.socket?.emit('servicio:nuevo', { servicioId, lat, lng });
  }

  notifyEstadoServicio(servicioId: string, status: string) {
    this.socket?.emit('servicio:estado', { servicioId, status });
  }

  // Listeners
  onServicioDisponible(callback: (data: any) => void) {
    this.socket?.on('servicio:disponible', callback);
  }

  onGrueroLocationUpdate(callback: (data: any) => void) {
    this.socket?.on('gruero:location:update', callback);
  }

  onServicioEstadoUpdate(callback: (data: any) => void) {
    this.socket?.on('servicio:estado:update', callback);
  }

  // Remover listeners
  offServicioDisponible() {
    this.socket?.off('servicio:disponible');
  }

  offGrueroLocationUpdate() {
    this.socket?.off('gruero:location:update');
  }

  offServicioEstadoUpdate() {
    this.socket?.off('servicio:estado:update');
  }
}

export const socketService = new SocketService();