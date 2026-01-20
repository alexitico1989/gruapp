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
import OneSignal from 'react-onesignal';

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

  // ✅ NUEVO - Función para resetear OneSignal
  const handleResetOneSignal = async () => {
    try {
      alert('Iniciando reset de OneSignal...');
      
      // Desloguear
      await OneSignal.logout();
      console.log('✅ OneSignal logout');
      
      // Esperar un poco
      await new Promise(r => setTimeout(r, 1000));
      
      // Re-loguear con prefijo
      const externalUserId = `gruero_${user?.id}`;
      await OneSignal.login(externalUserId);
      console.log('✅ OneSignal login:', externalUserId);
      
      alert('✅ OneSignal reseteado!\nExternal ID: ' + externalUserId);
    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  // Recuperar estado de rastreo al montar el componente
  useEffect(() => {
    const savedDisponible = sessionStorage.getItem('grueroDisponible');
    const savedRastreo = sessionStorage.getItem('gpsRastreoActivo');
    
    if (savedRastreo === 'true') {
      console.log('♻️ Rastreo GPS recuperado - reiniciando watchPosition');
      setRastreoActivo(true);
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

          const justLoggedIn = sessionStorage.getItem('justLoggedIn');
          if (justLoggedIn === 'true') {
            toast.success(`Bienvenido ${grueroData.user.nombre}!`);
            sessionStorage.removeItem('justLoggedIn');
          }
        }
      } catch (error: any) {
        console.error('❌ Error obteniendo perfil gruero:', error);
        toast.error('Error al cargar perfil de gruero');
        setPerfilCargado(true);
      }
    };

    initGruero();

    console.log('🔌 [Dashboard] Verificando socket global del Layout');
    
    const checkSocket = setInterval(() => {
      if (globalSocket) {
        console.log('✅ [Dashboard] Socket global encontrado, configurando listeners');
        clearInterval(checkSocket);
        socketRef.current = globalSocket;

        globalSocket.onAny((eventName, ...args) => {
          console.log(`📡 [Dashboard] Evento recibido: ${eventName}`, args);
        });

        globalSocket.on('gruero:nuevaSolicitud', (data: Servicio) => {
          console.log('🆕 Nueva solicitud recibida:', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        globalSocket.on('nuevo-servicio', (data: any) => {
          console.log('🆕 Nuevo servicio recibido:', data);
          const servicioData = data.servicio || data;
          setNuevaSolicitud(servicioData);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        globalSocket.on('nuevoServicio', (data: Servicio) => {
          console.log('🆕 Nuevo servicio (alternativo):', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        globalSocket.on('servicio:nuevo', (data: Servicio) => {
          console.log('🆕 Servicio nuevo (alternativo 2):', data);
          setNuevaSolicitud(data);
          setShowNuevaSolicitud(true);
          cargarServiciosPendientes();
        });

        globalSocket.on('nueva-notificacion', async (notificacion: any) => {
          console.log('🔔 [GrueroDashboard] Nueva notificación:', notificacion);
          
          if (notificacion.tipo === 'NUEVA_SOLICITUD' || notificacion.tipo === 'NUEVO_SERVICIO') {
            if (notificacion.servicioId) {
              try {
                const response = await api.get(`/servicios/${notificacion.servicioId}`);
                if (response.data.success && response.data.data) {
                  setNuevaSolicitud(response.data.data);
                  setShowNuevaSolicitud(true);
                  cargarServiciosPendientes();
                }
              } catch (error) {
                console.error('❌ Error cargando servicio:', error);
                cargarServiciosPendientes();
              }
            } else {
              cargarServiciosPendientes();
            }
          }
        });

        globalSocket.on('cliente:servicioAceptado', () => {
          toast.success('¡Servicio aceptado exitosamente!');
          cargarServicioActivo();
        });

        globalSocket.on('servicio:canceladoNotificacion', (data: { servicioId: string; canceladoPor: string; cliente: any }) => {
          console.log('🚫 Notificación de cancelación:', data);
          
          if (data.canceladoPor === 'CLIENTE') {
            toast.error(`${data.cliente.nombre} canceló el servicio`, {
              duration: 5000,
              icon: '❌',
            });
          }
          
          if (nuevaSolicitud && nuevaSolicitud.id === data.servicioId) {
            setShowNuevaSolicitud(false);
            setNuevaSolicitud(null);
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
            
            if (disponible && grueroId && socketRef.current) {
              console.log('🔄 Actualizando estado del gruero a DISPONIBLE');
              socketRef.current.emit('gruero:updateStatus', {
                grueroId,
                status: 'DISPONIBLE',
              });
            }
          } else {
            cargarServicioActivo();
          }
        });

        globalSocket.on('servicio-actualizado', (data: any) => {
          console.log('📢 Servicio actualizado:', data);
          
          if (data.nuevoEstado === 'COMPLETADO' || data.servicio?.status === 'COMPLETADO') {
            console.log('✅ Cliente completó - cerrando panel');
            
            toast.success('¡El cliente marcó el servicio como completado!', {
              icon: '🎉',
              duration: 4000,
            });
            
            setServicioActivo(null);
            cargarEstadisticas();
            cargarServiciosPendientes();
            
            if (disponible && grueroId && socketRef.current) {
              socketRef.current.emit('gruero:updateStatus', {
                grueroId,
                status: 'DISPONIBLE',
              });
            }
          }
        });

        globalSocket.on('error', (error: any) => {
          console.error('Socket error:', error);
        });
      }
    }, 100);

    return () => {
      clearInterval(checkSocket);
      if (socketRef.current) {
        socketRef.current.off('gruero:nuevaSolicitud');
        socketRef.current.off('nuevoServicio');
        socketRef.current.off('servicio:nuevo');
        socketRef.current.off('cliente:servicioAceptado');
        socketRef.current.off('servicio:canceladoNotificacion');
        socketRef.current.off('cliente:estadoActualizado');
        socketRef.current.off('servicio-actualizado');
        socketRef.current.off('error');
      }
    };
  }, [disponible, grueroId]);

  useEffect(() => {
    if (grueroId && socketRef.current && user) {
      console.log('📡 Registrando gruero en Socket:', grueroId);
      socketRef.current.emit('gruero:register', {
        grueroId,
        userId: user.id,
      });

      socketRef.current.on('gruero:registered', (data) => {
        console.log('✅ Gruero registrado:', data);
      });
    }
  }, [grueroId, user]);

  const iniciarRastreo = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    if (!grueroId) {
      console.error('❌ No hay grueroId para rastreo');
      toast.error('Error: ID de gruero no disponible');
      return;
    }

    if (gpsWatchId !== null) {
      console.log('✅ Rastreo GPS ya activo');
      setRastreoActivo(true);
      return;
    }

    console.log('🌍 Iniciando rastreo GPS:', grueroId);
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
        
        if (socketRef.current && grueroId) {
          socketRef.current.emit('gruero:updateLocation', {
            grueroId,
            lat: latitude,
            lng: longitude,
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
      console.log('🛑 Rastreo GPS detenido');
      toast.success('Rastreo GPS desactivado');
    }
  };

  const toggleDisponibilidad = async () => {
  if (!perfilCargado) {
    toast.error('Esperando carga del perfil...');
    return;
  }

  if (!grueroId) {
    toast.error('Error: ID de gruero no disponible');
    return;
  }

  const nuevoEstado = !disponible;

  try {
    setLoading(true);
    console.log('🔄 Actualizando disponibilidad:', nuevoEstado);
    
    const response = await api.patch('/gruero/disponibilidad', {
      disponible: nuevoEstado
    });

    if (response.data.success) {
      setDisponible(nuevoEstado);
      sessionStorage.setItem('grueroDisponible', nuevoEstado.toString());
      
      const nuevoStatus = nuevoEstado ? 'DISPONIBLE' : 'OFFLINE';
      
      if (socketRef.current) {
        socketRef.current.emit('gruero:updateStatus', {
          grueroId,
          status: nuevoStatus,
        });
      }

      if (nuevoEstado) {
        toast.success('¡Ahora estás disponible!');
      } else {
        toast.success('Te has puesto fuera de línea');
        detenerRastreo();
      }
    }
  } catch (error: any) {
    console.error('❌ Error al cambiar disponibilidad:', error);
    toast.error(error.response?.data?.message || 'Error al cambiar disponibilidad');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (disponible && grueroId) {
      if (rastreoActivo && gpsWatchId === null) {
        console.log('🌍 Reiniciando rastreo GPS');
        iniciarRastreo();
      } else if (!rastreoActivo) {
        console.log('🌍 Auto-iniciando rastreo GPS');
        iniciarRastreo();
      }
    }
  }, [disponible, grueroId, rastreoActivo]);

  const cargarServiciosPendientes = async () => {
    try {
      const response = await api.get('/servicios/pendientes');
      if (response.data.success) {
        const serviciosNuevos = response.data.data;
        
        if (disponible && serviciosAnteriores.length > 0 && serviciosNuevos.length > 0) {
          const nuevoServicio = serviciosNuevos.find((s: Servicio) => !serviciosAnteriores.includes(s.id));
          
          if (nuevoServicio && !servicioActivo) {
            console.log('🆕 Nuevo servicio detectado:', nuevoServicio);
            setNuevaSolicitud(nuevoServicio);
            setShowNuevaSolicitud(true);
            
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCxsvNW3jD0JFm+67ueUTAwUYLPn7KNUEgZDnN/vunYbCDmLze6rYhUGP5PY77t2GQk+isvyu3cuCDaGze+qYxQHP5HU8MJ2JQczhM3vr2EVCzGDzPCxbSMGMoLM769iEAYsf8rvrWMRBy1+yu6rYBIJL4DN761gEQsugMvtrWERCi+AzO+tYRIKL4DN761hEg==');
            audio.play().catch(() => {});
          }
        }
        
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
    if (nuevaSolicitud) {
      setServiciosPendientes(prev => prev.filter(s => s.id !== nuevaSolicitud.id));
    }
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
      {/* ✅ BOTÓN TEMPORAL DEBUG */}
      <div className="p-2 bg-red-100 border-b">
        <button 
          onClick={handleResetOneSignal}
          className="bg-red-600 text-white px-3 py-1.5 rounded font-bold text-xs"
        >
          🔧 Reset OneSignal
        </button>
      </div>

      {/* Resto del dashboard... */}
      <div className="flex flex-col h-[calc(100vh-104px)]">
        {/* ... todo tu código existente del dashboard ... */}
      </div>
    </Layout>
  );
}