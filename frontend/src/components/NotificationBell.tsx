import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ USAR SELECTORES REACTIVOS (fuerza re-render cuando cambian)
  const noLeidas = useNotificationStore((state) => state.noLeidas);
  const notificaciones = useNotificationStore((state) => state.notificaciones);
  const loading = useNotificationStore((state) => state.loading);
  
  // Acciones (no necesitan ser reactivas)
  const fetchNotificaciones = useNotificationStore((state) => state.fetchNotificaciones);
  const fetchContadorNoLeidas = useNotificationStore((state) => state.fetchContadorNoLeidas);
  const marcarLeida = useNotificationStore((state) => state.marcarLeida);
  const marcarTodasLeidas = useNotificationStore((state) => state.marcarTodasLeidas);
  const eliminarNotificacion = useNotificationStore((state) => state.eliminarNotificacion);

  // ✅ Cargar SOLO UNA VEZ al montar
  useEffect(() => {
    console.log('🔔 NotificationBell montado - Cargando datos iniciales');
    fetchContadorNoLeidas();
    fetchNotificaciones();
  }, []); // ← Dependencias vacías

  // ✅ Log cuando cambie noLeidas (debug)
  useEffect(() => {
    console.log('🔢 Badge actualizado - No leídas:', noLeidas);
  }, [noLeidas]);

  // Cargar notificaciones al abrir
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotificaciones();
    }
  };

  const handleMarcarLeida = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await marcarLeida(id);
  };

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await eliminarNotificacion(id);
  };

  const handleMarcarTodasLeidas = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await marcarTodasLeidas();
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'NUEVO_SERVICIO':
        return '🚗';
      case 'SERVICIO_ACEPTADO':
        return '✅';
      case 'EN_CAMINO':
        return '🚛';
      case 'EN_SITIO':
        return '📍';
      case 'COMPLETADO':
        return '🎉';
      case 'CANCELADO':
        return '❌';
      case 'CALIFICACION':
        return '⭐';
      case 'DOCUMENTO_VENCE':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const formatearFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      const ahora = new Date();
      const diferencia = ahora.getTime() - date.getTime();
      const minutos = Math.floor(diferencia / 80000);
      const horas = Math.floor(diferencia / 3600000);
      const dias = Math.floor(diferencia / 86400000);

      if (minutos < 1) return 'Ahora';
      if (minutos < 60) return `Hace ${minutos} min`;
      if (horas < 24) return `Hace ${horas}h`;
      if (dias < 7) return `Hace ${dias}d`;
      return format(date, "d 'de' MMM", { locale: es });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="relative">
      {/* Botón de la campana */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5 md:h-6 md:w-6" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel - RESPONSIVE */}
          <div className="fixed md:absolute right-0 md:right-0 top-16 md:top-auto md:mt-2 left-0 md:left-auto w-full md:w-96 bg-white md:rounded-lg shadow-2xl z-50 border-t md:border border-gray-200 max-h-[calc(100vh-64px)] md:max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Notificaciones</h3>
                <p className="text-xs md:text-sm text-gray-500">{noLeidas} sin leer</p>
              </div>
              <div className="flex items-center gap-2">
                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodasLeidas}
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Marcar todas</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm">Cargando...</p>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm md:text-base">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 md:p-4 hover:bg-gray-50 transition-colors relative ${
                        !notif.leida ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-2 md:gap-3">
                        {/* Indicador de no leída */}
                        {!notif.leida && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-1 md:left-2 top-4 md:top-6" />
                        )}

                        {/* Icono */}
                        <div className="text-xl md:text-2xl flex-shrink-0 ml-3 md:ml-0">
                          {getIconoTipo(notif.tipo)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-xs md:text-sm line-clamp-1">
                                {notif.titulo}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
                                {notif.mensaje}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatearFecha(notif.createdAt)}
                              </p>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {!notif.leida && (
                                <button
                                  onClick={(e) => handleMarcarLeida(notif.id, e)}
                                  className="p-1.5 md:p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Marcar como leída"
                                >
                                  <Check className="h-4 w-4 text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleEliminar(notif.id, e)}
                                className="p-1.5 md:p-1 hover:bg-red-100 rounded transition-colors"
                                title="Eliminar"
                              >
                                <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}