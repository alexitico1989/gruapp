import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Search } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import NotificationBell from './NotificationBell';
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { agregarNotificacion } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);

  // ✅ SOCKET.IO GLOBAL PARA NOTIFICACIONES
  useEffect(() => {
    if (!user) return;

    console.log('🔌 [Layout] Iniciando conexión Socket.IO global para notificaciones');
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ [Layout] Socket conectado globalmente, ID:', socket.id);

      // Registrar en sala según el rol
      if (user.role === 'GRUERO') {
        socket.emit('gruero:register', { grueroId: '', userId: user.id });
        console.log('🔔 [Layout] Gruero registrado en sala:', user.id);
      } else if (user.role === 'CLIENTE') {
        socket.emit('cliente:register', { userId: user.id });
        console.log('🔔 [Layout] Cliente registrado en sala:', user.id);
      }
    });

    // Listener para nuevas notificaciones (FUNCIONA EN TODAS LAS PÁGINAS)
    socket.on('nueva-notificacion', (notificacion) => {
      console.log('🔔 [Layout] Nueva notificación recibida:', notificacion);
      agregarNotificacion(notificacion);

      // Mostrar toast según el tipo
      if (user.role === 'GRUERO') {
        if (notificacion.tipo === 'NUEVO_SERVICIO') {
          toast('Nuevo servicio disponible cerca', { icon: '🚗', duration: 5000 });
        } else if (notificacion.tipo === 'CANCELADO') {
          toast.error(notificacion.mensaje, { icon: '❌', duration: 5000 });
        } else if (notificacion.tipo === 'CALIFICACION') {
          toast(notificacion.mensaje, { icon: '⭐', duration: 5000 });
        }
      } else if (user.role === 'CLIENTE') {
        if (notificacion.tipo === 'SERVICIO_ACEPTADO') {
          toast.success(notificacion.mensaje, { icon: '✅', duration: 5000 });
        } else if (notificacion.tipo === 'EN_CAMINO') {
          toast(notificacion.mensaje, { icon: '🚛', duration: 5000 });
        } else if (notificacion.tipo === 'EN_SITIO') {
          toast(notificacion.mensaje, { icon: '📍', duration: 5000 });
        } else if (notificacion.tipo === 'COMPLETADO') {
          toast.success(notificacion.mensaje, { icon: '🎉', duration: 5000 });
        } else if (notificacion.tipo === 'CANCELADO') {
          toast.error(notificacion.mensaje, { icon: '❌', duration: 5000 });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 [Layout] Socket desconectado');
    });

    return () => {
      console.log('🔌 [Layout] Desconectando Socket.IO global');
      socket.disconnect();
    };
  }, [user, agregarNotificacion]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Menu items según el rol
  const clienteMenuItems = [
    { name: 'Inicio', path: '/cliente/dashboard' },
    { name: 'Servicios', path: '/cliente/servicios' },
    { name: 'Reclamos', path: '/cliente/reclamos' },
    { name: 'Pagos', path: '/cliente/pagos' },
    { name: 'Perfil', path: '/cliente/perfil' },
    { name: 'Ayuda', path: '/cliente/ayuda' },
  ];

  const grueroMenuItems = [
    { name: 'Inicio', path: '/gruero/dashboard' },
    { name: 'Servicios', path: '/gruero/servicios' },
    { name: 'Perfil', path: '/gruero/perfil' },
  ];

  const menuItems = user?.role === 'CLIENTE' ? clienteMenuItems : grueroMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <GiTowTruck className="h-7 w-7 text-white" />
              <span className="text-xl font-bold">
                <span className="text-white">Gru</span>
                <span className="text-[#ff7a3d]">App</span>
              </span>
            </Link>

            {/* Menu Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-[#ff7a3d]'
                      : 'text-white hover:text-[#ff7a3d]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side - Search, Notifications, User, Logout */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden lg:flex items-center bg-white rounded-lg px-3 py-2 w-64">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full text-sm outline-none text-gray-700"
                />
              </div>

              {/* Notification Bell Component */}
              <NotificationBell />

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-[#ff7a3d] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block text-white text-sm font-medium">
                  {user?.nombre}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}