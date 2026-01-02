import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { Navigation, MapPin, CheckCircle, XCircle, Clock, DollarSign, Phone, Loader2 } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import { renderToStaticMarkup } from 'react-dom/server';
import Layout, { globalSocket } from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// CSS para el icono personalizado y animaciones
const style = document.createElement('style');
style.textContent = `
  .custom-truck-icon {
    background: transparent !important;
    border: none !important;
  }
  
  /* Popup compacto */
  .compact-popup .leaflet-popup-content-wrapper {
    padding: 4px;
  }
  
  .compact-popup .leaflet-popup-content {
    margin: 8px;
    font-size: 12px;
    line-height: 1.3;
  }
  
  /* Line clamp para direcciones largas */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.4s ease-out;
  }
`;
document.head.appendChild(style);

// Icono de grúa personalizado usando react-icons directamente
const grueroIcon = new DivIcon({
  className: 'custom-truck-icon',
  html: renderToStaticMarkup(
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#ff7a3d',
      border: '3px solid white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <GiTowTruck style={{ fontSize: '28px', color: 'white' }} />
    </div>
  ),
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -50],
});

const servicioIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  distanciaKm: number;
  totalCliente: number;
  totalGruero: number;
  status: string;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
}

interface Estadisticas {
  serviciosCompletados: number;
  serviciosActivos: number;
  gananciasHoy: number;
  gananciasSemana: number;
  calificacionPromedio: number;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    console.log('🗺️ Centrando mapa en:', position);
    map.setView(position, 15, { animate: true, duration: 1 });
  }, [position, map]);

  return null;
}

// Variable global para mantener el watchId del GPS
let gpsWatchId: number | null = null;

export default function GrueroDashboard() {
  const { user } = useAuthStore();
  const [disponible, setDisponible] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState<[number, number]>([-33.4489, -70.6693]);
  const [serviciosPendientes, setServiciosPendientes] = useState<Servicio[]>([]);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [grueroId, setGrueroId] = useState<string | null>(null);
  const [rastreoActivo, setRastreoActivo] = useState(false);
  const [perfilCargado, setPerfilCargado] = useState(false);
  
  // Estado para el pop-up de nueva solicitud
  const [showNuevaSolicitud, setShowNuevaSolicitud] = useState(false);
  const [nuevaSolicitud, setNuevaSolicitud] = useState<Servicio | null>(null);
  const [serviciosAnteriores, setServiciosAnteriores] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);

  // Recuperar estado de rastreo al montar el componente
  useEffect(() => {
    const savedDisponible = sessionStorage.getItem('grueroDisponible');
    const savedRastreo = sessionStorage.getItem('gpsRastreoActivo');
    
    if (savedRastreo === 'true') {
      console.log('♻️ Rastreo GPS recuperado - reiniciando watchPosition');
      setRastreoActivo(true);
      // NO llamar iniciarRastreo() aquí porque grueroId aún no está cargado
      // El rastreo se iniciará automáticamente en el useEffect de disponibilidad
    }
  }, []);

  // Obtener ubicación GPS inmediatamente al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nuevaUbicacion: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          console.log('📍 Ubicación inicial obtenida:', nuevaUbicacion);
          setUbicacionActual(nuevaUbicacion);
        },
        (error) => {
          console.error('❌ Error obteniendo ubicación inicial:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const initGruero = async () => {
      try {
        console.log('🔄 Cargando perfil de gruero...');
        const response = await api.get('/gruero/perfil');
        console.log('✅ Respuesta del perfil:', response.data);
        
        if (response.data.success) {
          const grueroData = response.data.data;
          console.log('✅ Gruero ID:', grueroData.id);
          setGrueroId(grueroData.id);
          
          // Recuperar estado de disponibilidad desde sessionStorage si existe
          const savedDisponible = sessionStorage.getItem('grueroDisponible');
          if (savedDisponible !== null) {
            setDisponible(savedDisponible === 'true');
            console.log('♻️ Estado de disponibilidad recuperado:', savedDisponible);
          } else {
            const estaDisponible = grueroData.status === 'DISPONIBLE';
            setDisponible(estaDisponible);
            sessionStorage.setItem('grueroDisponible', estaDisponible.toString());
          }
          
          setPerfilCargado(true);

          if (grueroData.latitud && grueroData.longitud) {
            setUbicacionActual([grueroData.latitud, grueroData.longitud]);
          }

          // Solo mostrar toast de bienvenida si acaba de iniciar sesión
          const justLoggedIn = sessionStorage.getItem('justLoggedIn');
          if (justLoggedIn === 'true') {
            toast.success(`Bienvenido ${grueroData.user.nombre}!`);
            sessionStorage.removeItem('justLoggedIn');
          }
        }
      } catch (error: any) {
        console.error('❌ Error obteniendo perfil gruero:', error);
        console.error('❌ Error response:', error.response?.data);
        toast.error('Error al cargar perfil de gruero');
        setPerfilCargado(true);
      }
    };

    initGruero();

    // Usar el socket global del Layout en lugar de crear uno nuevo
    console.log('🔌 [Dashboard] Verificando socket global del Layout');
    
    // Esperar a que el socket global esté disponible
    const checkSocket = setInterval(() => {
      if (globalSocket) {
        console.log('✅ [Dashboard] Socket global encontrado, configurando listeners');
        clearInterval(checkSocket);
        socketRef.current = globalSocket;

        // Escuchar TODOS los eventos para debugging
        globalSocket.onAny((eventName, ...args) => {
          console.log(`📡 [Dashboard] Evento recibido: ${eventName}`, args);
        });

        // Listener para nueva solicitud de servicio - Mostrar pop-up
        globalSocket.on('gruero:nuevaSolicitud', (data: Servicio) => {
          console.log('🆕 Nueva solicitud recibida:', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        // IMPORTANTE: El backend emite 'nuevo-servicio' con los datos completos del servicio
        globalSocket.on('nuevo-servicio', (data: any) => {
          console.log('🆕 Nuevo servicio recibido (evento nuevo-servicio):', data);
          console.log('🔍 Estructura del servicio:', JSON.stringify(data, null, 2));
          
          // El backend envía { servicio: {...}, distancia: X }
          // Necesitamos extraer el objeto servicio
          const servicioData = data.servicio || data;
          
          console.log('👤 Cliente:', servicioData.cliente);
          console.log('💰 Total gruero:', servicioData.totalGruero);
          console.log('🎯 Abriendo modal de nueva solicitud');
          
          setNuevaSolicitud(servicioData);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        // Listener alternativo por si el backend usa otro nombre
        globalSocket.on('nuevoServicio', (data: Servicio) => {
          console.log('🆕 Nuevo servicio (evento alternativo):', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        // Otro posible nombre de evento
        globalSocket.on('servicio:nuevo', (data: Servicio) => {
          console.log('🆕 Servicio nuevo (evento alternativo 2):', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        // NUEVO: Escuchar notificaciones genéricas y abrir modal si es nueva solicitud
        globalSocket.on('nueva-notificacion', async (notificacion: any) => {
          console.log('🔔 [GrueroDashboard] Nueva notificación recibida:', notificacion);
          console.log('🔔 Tipo de notificación:', notificacion.tipo);
          console.log('🔔 Servicio ID:', notificacion.servicioId);
          console.log('🔔 Datos completos:', notificacion);
          
          // Aceptar NUEVO_SERVICIO o NUEVA_SOLICITUD
          if (notificacion.tipo === 'NUEVA_SOLICITUD' || notificacion.tipo === 'NUEVO_SERVICIO') {
            console.log('📋 Detectada nueva solicitud de servicio');
            
            // Si tiene servicioId, cargar detalles
            if (notificacion.servicioId) {
              console.log('📋 Cargando detalles del servicio:', notificacion.servicioId);
              
              try {
                const response = await api.get(`/servicios/${notificacion.servicioId}`);
                console.log('📋 Respuesta del servicio:', response.data);
                
                if (response.data.success && response.data.data) {
                  console.log('✅ Servicio cargado exitosamente');
                  setNuevaSolicitud(response.data.data);
                  setShowNuevaSolicitud(true);
                  cargarServiciosPendientes();
                }
              } catch (error) {
                console.error('❌ Error cargando detalles del servicio:', error);
                cargarServiciosPendientes();
              }
            } 
            // Si no tiene servicioId, solo recargar la lista (el modal se abrirá con el listener de 'nuevo-servicio')
            else {
              console.log('📋 Sin servicioId, recargando lista de pendientes');
              cargarServiciosPendientes();
            }
          } else {
            console.log('ℹ️ Notificación tipo:', notificacion.tipo, '(no es nueva solicitud)');
          }
        });

        globalSocket.on('cliente:servicioAceptado', () => {
          toast.success('¡Servicio aceptado exitosamente!');
          cargarServicioActivo();
        });

        globalSocket.on('servicio:canceladoNotificacion', (data: { servicioId: string; canceladoPor: string; cliente: any; gruero: any }) => {
          console.log('🚫 Notificación de cancelación recibida:', data);
          
          if (data.canceladoPor === 'CLIENTE') {
            toast.error(`${data.cliente.nombre} canceló el servicio`, {
              duration: 5000,
              icon: '❌',
            });
          }
          
          setServicioActivo(null);
          cargarEstadisticas();
          cargarServiciosPendientes();
        });

        globalSocket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string }) => {
          console.log('📢 Estado actualizado por cliente:', data);
          
          if (data.status === 'COMPLETADO') {
            toast.success('¡Servicio completado por el cliente!', {
              icon: '🎉',
              duration: 4000,
            });
            setServicioActivo(null);
            cargarEstadisticas();
            cargarServiciosPendientes();
          } else {
            cargarServicioActivo();
          }
        });

        globalSocket.on('error', (error: any) => {
          console.error('Socket error:', error);
        });
      }
    }, 100);

    return () => {
      clearInterval(checkSocket);
      // NO desconectar el socket global, solo limpiar listeners
      if (socketRef.current) {
        socketRef.current.off('gruero:nuevaSolicitud');
        socketRef.current.off('nuevoServicio');
        socketRef.current.off('servicio:nuevo');
        socketRef.current.off('cliente:servicioAceptado');
        socketRef.current.off('servicio:canceladoNotificacion');
        socketRef.current.off('cliente:estadoActualizado');
        socketRef.current.off('error');
      }
      // NO detener rastreo GPS aquí - debe persistir entre cambios de sección
    };
  }, []);

  useEffect(() => {
    if (grueroId && socketRef.current && user) {
      console.log('📡 Registrando gruero en Socket para servicios:', grueroId);
      socketRef.current.emit('gruero:register', {
        grueroId,
        userId: user.id,
      });

      socketRef.current.on('gruero:registered', (data) => {
        console.log('✅ Gruero registrado en Socket:', data);
      });
    }
  }, [grueroId, user]);

  const iniciarRastreo = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    if (!grueroId) {
      console.error('❌ No hay grueroId disponible para rastreo');
      toast.error('Error: ID de gruero no disponible. Recarga la página.');
      return;
    }

    // Si ya está rastreando, no iniciar de nuevo
    if (gpsWatchId !== null) {
      console.log('✅ Rastreo GPS ya está activo, no se reinicia');
      setRastreoActivo(true);
      return;
    }

    console.log('🌍 Iniciando rastreo GPS para gruero:', grueroId);
    toast.success('Rastreo GPS activado');
    setRastreoActivo(true);
    sessionStorage.setItem('gpsRastreoActivo', 'true');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nuevaUbicacion: [number, number] = [latitude, longitude];
        
        console.log('📍 Ubicación inicial:', latitude, longitude);
        setUbicacionActual(nuevaUbicacion);
        
        if (socketRef.current && grueroId) {
          socketRef.current.emit('gruero:updateLocation', {
            grueroId,
            lat: latitude,
            lng: longitude,
          });
        }
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        toast.error('No se pudo obtener tu ubicación');
        setRastreoActivo(false);
        sessionStorage.removeItem('gpsRastreoActivo');
      }
    );

    gpsWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nuevaUbicacion: [number, number] = [latitude, longitude];
        
        console.log('📍 Ubicación actualizada:', latitude, longitude);
        setUbicacionActual(nuevaUbicacion);
        
        console.log('🔍 Verificando socket:', {
          socketExists: !!socketRef.current,
          socketConnected: socketRef.current?.connected,
          grueroId: grueroId,
        });
        
        if (socketRef.current && grueroId) {
          console.log('📤 Emitiendo gruero:updateLocation con:', {
            grueroId,
            lat: latitude,
            lng: longitude,
          });
          
          socketRef.current.emit('gruero:updateLocation', {
            grueroId,
            lat: latitude,
            lng: longitude,
          });
          
          console.log('✅ Evento gruero:updateLocation emitido');
        } else {
          console.warn('⚠️ No se puede emitir ubicación:', {
            noSocket: !socketRef.current,
            noGrueroId: !grueroId,
          });
        }
      },
      (error) => {
        console.error('❌ Error en rastreo GPS:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    console.log('💾 GPS WatchId:', gpsWatchId);
  };

  const detenerRastreo = () => {
    if (gpsWatchId !== null) {
      navigator.geolocation.clearWatch(gpsWatchId);
      gpsWatchId = null;
      sessionStorage.removeItem('gpsRastreoActivo');
      setRastreoActivo(false);
      console.log('🛑 Rastreo GPS detenido completamente');
      toast.success('Rastreo GPS desactivado');
    }
  };

  const toggleDisponibilidad = async () => {
    if (!perfilCargado) {
      toast.error('Esperando carga del perfil...');
      return;
    }

    if (!grueroId) {
      toast.error('Error: ID de gruero no disponible. Recarga la página.');
      return;
    }

    const nuevoEstado = !disponible;
    const nuevoStatus = nuevoEstado ? 'DISPONIBLE' : 'OFFLINE';

    try {
      setLoading(true);
      console.log('🔄 Actualizando disponibilidad a:', nuevoStatus);
      
      const response = await api.patch('/gruero/disponibilidad', {
        status: nuevoStatus,
      });

      console.log('✅ Respuesta disponibilidad:', response.data);

      if (response.data.success) {
        setDisponible(nuevoEstado);
        sessionStorage.setItem('grueroDisponible', nuevoEstado.toString());
        
        if (socketRef.current) {
          socketRef.current.emit('gruero:updateStatus', {
            grueroId,
            status: nuevoStatus,
          });
        }

        if (nuevoEstado) {
          toast.success('¡Ahora estás disponible para servicios!');
        } else {
          toast.success('Te has puesto fuera de línea');
          detenerRastreo();
        }
      }
    } catch (error: any) {
      console.error('❌ Error al cambiar disponibilidad:', error);
      console.error('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al cambiar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // Activar rastreo GPS automáticamente cuando está disponible
  useEffect(() => {
    if (disponible && grueroId) {
      // Si rastreoActivo es true pero no hay watchId, significa que se recuperó del sessionStorage
      // y necesitamos reiniciar el watchPosition
      if (rastreoActivo && gpsWatchId === null) {
        console.log('🌍 Reiniciando rastreo GPS recuperado del sessionStorage');
        iniciarRastreo();
      } else if (!rastreoActivo) {
        console.log('🌍 Auto-iniciando rastreo GPS porque el gruero está disponible');
        iniciarRastreo();
      }
    }
  }, [disponible, grueroId, rastreoActivo]);

  const cargarServiciosPendientes = async () => {
    try {
      const response = await api.get('/servicios/pendientes');
      if (response.data.success) {
        const serviciosNuevos = response.data.data;
        
        // Detectar si hay un servicio nuevo
        if (disponible && serviciosAnteriores.length > 0 && serviciosNuevos.length > 0) {
          const idsAnteriores = serviciosAnteriores;
          const nuevoServicio = serviciosNuevos.find((s: Servicio) => !idsAnteriores.includes(s.id));
          
          if (nuevoServicio && !servicioActivo) {
            console.log('🆕 Nuevo servicio detectado:', nuevoServicio);
            setNuevaSolicitud(nuevoServicio);
            setShowNuevaSolicitud(true);
            
            // Reproducir sonido de notificación (opcional)
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCxsvNW3jD0JFm+67ueUTAwUYLPn7KNUEgZDnN/vunYbCDmLze6rYhUGP5PY77t2GQk+isvyu3cuCDaGze+qYxQHP5HU8MJ2JQczhM3vr2EVCzGDzPCxbSMGMoLM769iEAYsf8rvrWMRBy1+yu6rYBIJL4DN761gEQsugMvtrWERCi+AzO+tYRIKL4DN761hEg==');
            audio.play().catch(() => {}); // Ignorar si falla
          }
        }
        
        // Actualizar lista de IDs anteriores
        setServiciosAnteriores(serviciosNuevos.map((s: Servicio) => s.id));
        setServiciosPendientes(serviciosNuevos);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error cargando servicios:', error);
      }
    }
  };

  const cargarServicioActivo = async () => {
    try {
      const response = await api.get('/servicios/mis-servicios');
      if (response.data.success) {
        const activo = response.data.data.find(
          (s: Servicio) => !['COMPLETADO', 'CANCELADO'].includes(s.status)
        );
        setServicioActivo(activo || null);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error cargando servicio activo:', error);
      }
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await api.get('/gruero/estadisticas');
      if (response.data.success) {
        setEstadisticas(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error cargando estadísticas:', error);
      }
    }
  };

  const aceptarServicio = async (servicioId: string) => {
    try {
      setLoading(true);
      const response = await api.post(`/servicios/${servicioId}/aceptar`);

      if (response.data.success) {
        toast.success('¡Servicio aceptado!');
        
        if (socketRef.current && grueroId) {
          socketRef.current.emit('servicio:aceptado', {
            servicioId,
            grueroId,
          });
        }

        // Cerrar pop-up si está abierto
        setShowNuevaSolicitud(false);
        setNuevaSolicitud(null);

        cargarServicioActivo();
        cargarServiciosPendientes();
      }
    } catch (error: any) {
      console.error('Error al aceptar servicio:', error);
      toast.error(error.response?.data?.message || 'Error al aceptar servicio');
    } finally {
      setLoading(false);
    }
  };

  const rechazarServicio = () => {
    setShowNuevaSolicitud(false);
    setNuevaSolicitud(null);
    toast('Solicitud rechazada', { icon: '👋' });
  };

  const actualizarEstadoServicio = async (nuevoEstado: string) => {
    if (!servicioActivo) return;

    try {
      const response = await api.patch(`/servicios/${servicioActivo.id}/estado`, {
        status: nuevoEstado,
      });

      if (response.data.success) {
        toast.success(`Estado actualizado: ${nuevoEstado}`);
        
        if (socketRef.current && grueroId) {
          console.log('📤 Emitiendo servicio:estadoActualizado', {
            servicioId: servicioActivo.id,
            status: nuevoEstado,
          });
          socketRef.current.emit('servicio:estadoActualizado', {
            servicioId: servicioActivo.id,
            status: nuevoEstado,
          });
        }
        
        if (nuevoEstado === 'COMPLETADO') {
          setServicioActivo(null);
        } else {
          cargarServicioActivo();
        }
        
        cargarEstadisticas();
      }
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const cancelarServicio = async () => {
    if (!servicioActivo) return;

    const confirmar = window.confirm('¿Estás seguro de cancelar este servicio?');
    if (!confirmar) return;

    try {
      const response = await api.patch(`/servicios/${servicioActivo.id}/cancelar`);

      if (response.data.success) {
        toast.success('Servicio cancelado');
        
        if (socketRef.current && grueroId) {
          socketRef.current.emit('servicio:cancelado', {
            servicioId: servicioActivo.id,
            canceladoPor: 'GRUERO',
          });
        }
        
        setServicioActivo(null);
        cargarEstadisticas();
        cargarServiciosPendientes();
      }
    } catch (error: any) {
      console.error('Error al cancelar servicio:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar servicio');
    }
  };

  useEffect(() => {
    if (disponible && grueroId) {
      cargarServiciosPendientes();
      cargarServicioActivo();
    }
    if (grueroId) {
      cargarEstadisticas();
    }

    const interval = setInterval(() => {
      if (disponible && grueroId) {
        cargarServiciosPendientes();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [disponible, grueroId]);

  if (!perfilCargado) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#ff7a3d] mx-auto mb-4" />
            <p className="text-gray-600">Cargando perfil de gruero...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Panel Superior - Info del Gruero (Compacto) */}
        <div className="bg-white border-b border-gray-200 overflow-x-auto">
          <div className="p-3 md:p-4">
            {/* Contenedor horizontal con scroll */}
            <div className="flex gap-3 md:gap-4 min-w-max">
              {/* Estado de Disponibilidad */}
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] rounded-lg p-3 text-white min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Estado</span>
                  <button
                    onClick={toggleDisponibilidad}
                    disabled={loading || !grueroId}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      disponible ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        disponible ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center text-sm">
                  {disponible ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Disponible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>

              {/* Rastreo GPS */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-900 text-sm">Rastreo GPS</span>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      rastreoActivo ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <p className="text-xs text-blue-700">
                  {rastreoActivo ? 'Activo' : 'Inactivo'}
                </p>
              </div>

              {/* Estadísticas */}
              {estadisticas && (
                <>
                  <div className="bg-green-50 p-3 rounded-lg min-w-[120px]">
                    <p className="text-xs text-gray-600">Completados</p>
                    <p className="text-xl font-bold text-green-600">{estadisticas.serviciosCompletados}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg min-w-[100px]">
                    <p className="text-xs text-gray-600">Activos</p>
                    <p className="text-xl font-bold text-blue-600">{estadisticas.serviciosActivos}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg min-w-[100px]">
                    <p className="text-xs text-gray-600">Hoy</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${estadisticas.gananciasHoy.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg min-w-[100px]">
                    <p className="text-xs text-gray-600">Semana</p>
                    <p className="text-lg font-bold text-orange-600">
                      ${estadisticas.gananciasSemana.toLocaleString('es-CL')}
                    </p>
                  </div>
                </>
              )}

              {/* Servicio Activo */}
              {servicioActivo && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 min-w-[300px] max-w-[400px]">
                  <h3 className="font-bold text-orange-900 mb-2 text-sm">Servicio Activo</h3>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-semibold">Cliente:</span>{' '}
                      {servicioActivo.cliente?.user?.nombre || servicioActivo.cliente?.nombre || 'Cliente'} {servicioActivo.cliente?.user?.apellido || servicioActivo.cliente?.apellido || ''}
                    </div>
                    <div>
                      <span className="font-semibold">Distancia:</span> {servicioActivo.distanciaKm} km
                    </div>
                    <div className="text-sm font-bold text-orange-600">
                      ${servicioActivo.totalGruero.toLocaleString('es-CL')}
                    </div>
                    
                    {/* Botones de Estado - Compactos */}
                    <div className="flex gap-2 mt-2">
                      {servicioActivo.status === 'ACEPTADO' && (
                        <button
                          onClick={() => actualizarEstadoServicio('EN_CAMINO')}
                          className="flex-1 bg-blue-500 text-white rounded-lg py-1.5 text-xs font-semibold"
                        >
                          🚗 En Camino
                        </button>
                      )}
                      {servicioActivo.status === 'EN_CAMINO' && (
                        <button
                          onClick={() => actualizarEstadoServicio('EN_SITIO')}
                          className="flex-1 bg-purple-500 text-white rounded-lg py-1.5 text-xs font-semibold"
                        >
                          📍 En Sitio
                        </button>
                      )}
                      {servicioActivo.status === 'EN_SITIO' && (
                        <button
                          onClick={() => actualizarEstadoServicio('COMPLETADO')}
                          className="flex-1 bg-green-500 text-white rounded-lg py-1.5 text-xs font-semibold"
                        >
                          ✅ Completar
                        </button>
                      )}
                      
                      {(servicioActivo.cliente?.user?.telefono || servicioActivo.cliente?.telefono) && (
                        <a 
                          href={`tel:${servicioActivo.cliente?.user?.telefono || servicioActivo.cliente?.telefono}`}
                          className="bg-orange-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center"
                        >
                          <Phone className="h-3 w-3" />
                        </a>
                      )}
                      
                      <button 
                        onClick={cancelarServicio}
                        className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Servicios Disponibles */}
              {disponible && !servicioActivo && serviciosPendientes.length > 0 && (
                <div className="flex gap-3">
                  {serviciosPendientes.map((servicio) => (
                    <div
                      key={servicio.id}
                      className="border-2 border-gray-200 rounded-lg p-3 hover:border-[#ff7a3d] transition-colors min-w-[250px]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs">
                          <p className="font-semibold">
                            {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                          </p>
                          <p className="text-gray-600">{servicio.distanciaKm} km</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-green-600">
                            ${servicio.totalGruero.toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => aceptarServicio(servicio.id)}
                        disabled={loading}
                        className="w-full bg-[#ff7a3d] text-white rounded-lg py-2 text-xs font-semibold disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Aceptar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {disponible && !servicioActivo && serviciosPendientes.length === 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg min-w-[200px]">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Sin servicios</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mapa - Ocupa el resto de la pantalla */}
        <div className="flex-1 relative">
          <MapContainer center={ubicacionActual} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap position={ubicacionActual} />

            <Marker position={ubicacionActual} icon={grueroIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Tu ubicación</p>
                  <p className="text-xs text-gray-600">
                    {rastreoActivo ? 'Rastreo activo' : 'Rastreo inactivo'}
                  </p>
                </div>
              </Popup>
            </Marker>

            {disponible && (
              <Circle
                center={ubicacionActual}
                radius={5000}
                pathOptions={{
                  color: '#4ade80',
                  fillColor: '#4ade80',
                  fillOpacity: 0.1,
                }}
              />
            )}

            {serviciosPendientes.map((servicio) => (
              <Marker key={servicio.id} position={[servicio.origenLat, servicio.origenLng]} icon={servicioIcon}>
                <Popup maxWidth={240} className="compact-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-[#1e3a5f] mb-2 flex items-center text-xs">
                      <GiTowTruck className="h-4 w-4 mr-1" />
                      Servicio Disponible
                    </h3>
                    
                    {/* Cliente - Compacto */}
                    <div className="mb-2 pb-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-xs">
                        {servicio.cliente?.user?.nombre || servicio.cliente?.nombre || 'Cliente'} {servicio.cliente?.user?.apellido || servicio.cliente?.apellido || ''}
                      </p>
                      {(servicio.cliente?.user?.telefono || servicio.cliente?.telefono) && (
                        <a 
                          href={`tel:${servicio.cliente?.user?.telefono || servicio.cliente?.telefono}`}
                          className="text-xs text-blue-600 hover:underline flex items-center"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {servicio.cliente?.user?.telefono || servicio.cliente?.telefono}
                        </a>
                      )}
                    </div>

                    {/* Direcciones - Compactas */}
                    <div className="mb-2 space-y-1">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-900 line-clamp-2">{servicio.origenDireccion}</p>
                      </div>
                      <div className="flex items-start gap-1">
                        <Navigation className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-900 line-clamp-2">{servicio.destinoDireccion}</p>
                      </div>
                    </div>

                    {/* Info compacta */}
                    <div className="flex justify-between items-center mb-2 py-1 bg-gray-50 rounded px-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{servicio.distanciaKm} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          ${servicio.totalGruero.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => aceptarServicio(servicio.id)}
                      disabled={loading}
                      className="w-full bg-[#ff7a3d] hover:bg-[#e66a2d] text-white rounded-lg py-1.5 font-semibold disabled:opacity-50 transition-colors text-xs"
                    >
                      {loading ? 'Aceptando...' : 'Aceptar'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {servicioActivo && (
              <>
                <Marker position={[servicioActivo.origenLat, servicioActivo.origenLng]} icon={servicioIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Origen</p>
                      <p className="text-xs">{servicioActivo.origenDireccion}</p>
                    </div>
                  </Popup>
                </Marker>
                <Marker position={[servicioActivo.destinoLat, servicioActivo.destinoLng]} icon={servicioIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Destino</p>
                      <p className="text-xs">{servicioActivo.destinoDireccion}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* Pop-up Modal de Nueva Solicitud */}
      {showNuevaSolicitud && nuevaSolicitud && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-slideUp">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ff7a3d] to-[#ff9d5c] p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-2">
                <div className="bg-white rounded-full p-3">
                  <GiTowTruck className="text-[#ff7a3d] text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                ¡Nueva Solicitud!
              </h2>
              <p className="text-white text-center text-sm mt-1 opacity-90">
                Un cliente necesita tus servicios
              </p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Cliente</p>
                <p className="font-bold text-lg text-gray-900">
                  {nuevaSolicitud.cliente?.user?.nombre || nuevaSolicitud.cliente?.nombre || 'Cliente'} {nuevaSolicitud.cliente?.user?.apellido || nuevaSolicitud.cliente?.apellido || ''}
                </p>
                {(nuevaSolicitud.cliente?.user?.telefono || nuevaSolicitud.cliente?.telefono) && (
                  <a 
                    href={`tel:${nuevaSolicitud.cliente?.user?.telefono || nuevaSolicitud.cliente?.telefono}`}
                    className="text-blue-600 text-sm flex items-center mt-1 hover:underline"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {nuevaSolicitud.cliente?.user?.telefono || nuevaSolicitud.cliente?.telefono}
                  </a>
                )}
              </div>

              {/* Origen */}
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Origen</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {nuevaSolicitud.origenDireccion}
                  </p>
                </div>
              </div>

              {/* Destino */}
              <div className="flex items-start space-x-3">
                <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                  <Navigation className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600">Destino</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {nuevaSolicitud.destinoDireccion}
                  </p>
                </div>
              </div>

              {/* Distancia y Ganancia */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Distancia</p>
                  <p className="text-xl font-bold text-gray-900">{nuevaSolicitud.distanciaKm} km</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600">Tu Ganancia</p>
                  <p className="text-xl font-bold text-green-600">
                    ${nuevaSolicitud.totalGruero.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={rechazarServicio}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Rechazar
              </button>
              <button
                onClick={() => aceptarServicio(nuevaSolicitud.id)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#ff7a3d] to-[#ff9d5c] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Aceptando...' : '¡Aceptar!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}