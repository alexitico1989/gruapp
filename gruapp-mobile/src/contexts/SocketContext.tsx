import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const registeredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        console.log('🔌 Desconectando socket (no autenticado)');
        socketRef.current.disconnect();
        socketRef.current = null;
        registeredRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    if (socketRef.current?.connected) {
      console.log('♻️ Socket ya conectado, re-registrando usuario...');
      
      if (user?.role === 'GRUERO' && registeredRef.current !== `gruero:${user.id}`) {
        socketRef.current.emit('gruero:register', {
          grueroId: user.id,
          userId: user.id,
        });
        registeredRef.current = `gruero:${user.id}`;
        console.log('📡 Gruero re-registrado:', user.id);
      } else if (user?.role === 'CLIENTE' && registeredRef.current !== `cliente:${user.id}`) {
        socketRef.current.emit('cliente:register', {
          clienteId: user.id,
          userId: user.id,
        });
        registeredRef.current = `cliente:${user.id}`;
        console.log('📡 Cliente re-registrado:', user.id);
      }
      
      return;
    }

    console.log('🔌 Conectando a Socket.IO...');
    const newSocket = io('https://gruapp-production.up.railway.app', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket conectado:', newSocket.id);
      setConnected(true);

      if (user?.role === 'GRUERO') {
        newSocket.emit('gruero:register', {
          grueroId: user.id,
          userId: user.id,
        });
        registeredRef.current = `gruero:${user.id}`;
        console.log('📡 Gruero registrado en socket');
      } else if (user?.role === 'CLIENTE') {
        newSocket.emit('cliente:register', {
          clienteId: user.id,
          userId: user.id,
        });
        registeredRef.current = `cliente:${user.id}`;
        console.log('📡 Cliente registrado en socket');
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason);
      setConnected(false);
      registeredRef.current = null;
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setConnected(false);
    });

    newSocket.onAny((eventName, ...args) => {
      console.log(`📡 Evento recibido: ${eventName}`, args);
    });

    setSocket(newSocket);

    return () => {
      if (!isAuthenticated) {
        console.log('🔌 Limpiando socket (logout)...');
        newSocket.disconnect();
        socketRef.current = null;
        registeredRef.current = null;
      }
    };
  }, [isAuthenticated, token, user?.id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};