import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Search, Menu, X } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import NotificationBell from './NotificationBell';
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://gruapp-production.up.railway.app';

// Exportar instancia del socket para reutilizarla en otros componentes (evita múltiples conexiones)
export let globalSocket: Socket | null = null;

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { agregarNotificacion } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ SOCKET.IO GLOBAL PARA NOTIFICACIONES
  useEffect(() => {
    if (!user) return;

    console.log('🔌 [Layout] Iniciando conexión Socket.IO global para notificaciones');
    console.log('🔌 [Layout] URL de conexión:', API_URL);
    
    const socket = io(API_URL);
    socketRef.current = socket;
    globalSocket = socket; // Exportar para uso global

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
      globalSocket = null;
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

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <GiTowTruck className="h-6 w-6 md:h-7 md:w-7 text-white" />
              <span className="text-lg md:text-xl font-bold">
                <span className="text-white">Gru</span>
                <span className="text-[#ff7a3d]">App</span>
              </span>
            </Link>

            {/* Menu Navigation Desktop */}
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
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search - Hidden on mobile */}
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
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-9 h-9 bg-[#ff7a3d] rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block text-white text-sm font-medium">
                  {user?.nombre}
                </span>
              </div>

              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Salir</span>
              </button>

              {/* Hamburger Menu Button - Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="md:hidden fixed top-16 left-0 right-0 bg-[#1e3a5f] border-t border-[#2d4a6f] z-50 shadow-xl">
              <nav className="px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#ff7a3d] text-white'
                        : 'text-white hover:bg-[#2d4a6f]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* User Info Mobile */}
                <div className="sm:hidden pt-3 border-t border-[#2d4a6f] mt-3">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-10 h-10 bg-[#ff7a3d] rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user?.nombre}</p>
                      <p className="text-gray-300 text-xs">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Logout Mobile */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}