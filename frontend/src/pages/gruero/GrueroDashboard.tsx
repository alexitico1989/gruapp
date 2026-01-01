import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Navigation, MapPin, CheckCircle, XCircle, Clock, DollarSign, Phone, Loader2 } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';
import io, { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Icono de grúa personalizado usando el mismo diseño del logo (camión de grúa naranja)
const grueroIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZmY3YTNkIj48cGF0aCBkPSJNMjAgOGgtM1Y0SDN2NWgybC0uMDEgNi4wMWMtMS4yMi4wMy0yLjE4IDEuMDYtMi4xOCAyLjI4QzIuODEgMTguNyAzLjgxIDE5LjcgNSAxOS43YzEuMTkgMCAxLjQ5LTEuMDEgMS40OS0yLjQxIDAtMS4yMi0uOTUtMi4yNi0yLjE3LTIuMjlWOWgxMXY3Ljk5Yy0xLjIyLjAyLTIuMTggMS4wNi0yLjE4IDIuMjggMCAxLjM5IDEuMDEgMi40MSAxLjE5IDIuNDEgMS4xOSAwIDIuMTktLjk5IDIuMTktMi4zOSAwLTEuMjItLjk1LTIuMjYtMi4xNy0yLjI5VjloM2MxLjEgMCAyLS45IDItMlY4ek0xMSA2aDJsLjAxIDEuOTlIOWwuMDEtMnoiLz48L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
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

  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
          setDisponible(grueroData.status === 'DISPONIBLE');
          setPerfilCargado(true);

          if (grueroData.latitud && grueroData.longitud) {
            setUbicacionActual([grueroData.latitud, grueroData.longitud]);
          }

          // Solo mostrar toast de bienvenida si acaba de iniciar sesión
          const justLoggedIn = sessionStorage.getItem('justLoggedIn');
          if (justLoggedIn === 'true') {
            toast.success(`Bienvenido ${grueroData.user.nombre}!`);
            sessionStorage.removeItem('justLoggedIn'); // Limpiar el flag
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

    const socket = io('https://gruapp-production.up.railway.app');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket conectado para servicios');
    });

    socket.on('cliente:servicioAceptado', () => {
      toast.success('¡Servicio aceptado exitosamente!');
      cargarServicioActivo();
    });

    socket.on('servicio:canceladoNotificacion', (data: { servicioId: string; canceladoPor: string; cliente: any; gruero: any }) => {
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

    socket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string }) => {
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

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.disconnect();
      detenerRastreo();
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

    console.log('🌍 Iniciando rastreo GPS para gruero:', grueroId);
    toast.success('Rastreo GPS activado');
    setRastreoActivo(true);

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
      }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
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
  };

  const detenerRastreo = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
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
        
        if (socketRef.current) {
          socketRef.current.emit('gruero:updateStatus', {
            grueroId,
            status: nuevoStatus,
          });
        }

        if (nuevoEstado) {
          toast.success('¡Ahora estás disponible para servicios!');
          iniciarRastreo();
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

  const cargarServiciosPendientes = async () => {
    try {
      const response = await api.get('/servicios/pendientes');
      if (response.data.success) {
        setServiciosPendientes(response.data.data);
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
                      ${(estadisticas.gananciasHoy / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg min-w-[100px]">
                    <p className="text-xs text-gray-600">Semana</p>
                    <p className="text-lg font-bold text-orange-600">
                      ${(estadisticas.gananciasSemana / 1000).toFixed(0)}k
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
                      {servicioActivo.cliente.user.nombre} {servicioActivo.cliente.user.apellido}
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
                      
                      <a 
                        href={`tel:${servicioActivo.cliente.user.telefono}`}
                        className="bg-orange-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                      
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
                            ${(servicio.totalGruero / 1000).toFixed(0)}k
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
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <h3 className="font-bold text-[#1e3a5f] mb-2 flex items-center text-sm">
                      <GiTowTruck className="h-5 w-5 mr-2" />
                      Servicio Disponible
                    </h3>
                    
                    <div className="mb-3 pb-2 border-b">
                      <p className="text-xs text-gray-600 mb-1">Cliente:</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {servicio.cliente.user.nombre} {servicio.cliente.user.apellido}
                      </p>
                      <a 
                        href={`tel:${servicio.cliente.user.telefono}`}
                        className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {servicio.cliente.user.telefono}
                      </a>
                    </div>

                    <div className="mb-2">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600">Origen:</p>
                          <p className="text-xs font-medium text-gray-900">{servicio.origenDireccion}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 pb-2 border-b">
                      <div className="flex items-start">
                        <Navigation className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600">Destino:</p>
                          <p className="text-xs font-medium text-gray-900">{servicio.destinoDireccion}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Distancia:</p>
                        <p className="font-semibold text-gray-900 text-sm">{servicio.distanciaKm} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Tu ganancia:</p>
                        <p className="text-base font-bold text-green-600">
                          ${(servicio.totalGruero / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => aceptarServicio(servicio.id)}
                      disabled={loading}
                      className="w-full bg-[#ff7a3d] hover:bg-[#e66a2d] text-white rounded-lg py-2 font-semibold disabled:opacity-50 transition-colors text-sm"
                    >
                      {loading ? 'Aceptando...' : 'Aceptar Servicio'}
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
    </Layout>
  );
}