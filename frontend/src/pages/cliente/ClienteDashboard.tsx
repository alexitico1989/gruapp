import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { Icon, LatLngBounds, DivIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, Navigation, Truck, Clock, Star, Phone, Loader2, Car, BusFront, Bike, CheckCircle, User } from 'lucide-react';
import { GiTowTruck } from 'react-icons/gi';
import Layout, { globalSocket } from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import api from '../../lib/api';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import ServiceNotification from '../../components/ServiceNotification';
import RatingModal from '../../components/RatingModal';
import 'leaflet/dist/leaflet.css';

// CSS para direcciones truncadas y ícono personalizado
const style = document.createElement('style');
style.textContent = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .custom-truck-icon {
    background: transparent !important;
    border: none !important;
  }
`;
document.head.appendChild(style);

const API_URL = import.meta.env.VITE_API_URL || 'https://gruapp-production.up.railway.app/api';

// Ícono de grúa personalizado con círculo naranja
const createTruckIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#ff7a3d',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <GiTowTruck style={{ fontSize: '28px', color: 'white' }} />
    </div>
  );

  return new DivIcon({
    html: iconMarkup,
    className: 'custom-truck-icon',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  });
};

const gruaIcon = createTruckIcon();

const clientIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Grua {
  id: string;
  nombre: string;
  telefono: string;
  patente: string;
  marca: string;
  modelo: string;
  capacidad: number;
  ubicacion: { lat: number; lng: number };
  calificacion: number;
  totalServicios: number;
  fotoGruero?: string | null;
  fotoGrua?: string | null;
}

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  status: string;
  totalCliente: number;
  distanciaKm: number;
  gruero?: {
    patente: string;
    marca: string;
    modelo: string;
    capacidadToneladas: number;
    calificacionPromedio: number;
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
  createdAt: string;
}

interface Sugerencia {
  display_name: string;
  lat: string;
  lon: string;
}

interface RutaInfo {
  distancia: number;
  duracion: number;
  coordenadas: [number, number][];
}

const tiposVehiculos = [
  { id: 'AUTOMOVIL', label: 'Automóvil', icon: Car },
  { id: 'CAMIONETA', label: 'Camioneta', icon: Truck },
  { id: 'LIVIANO', label: 'Liviano', icon: Car },
  { id: 'LUJO', label: 'Lujo', icon: Car },
  { id: 'FURGONETA', label: 'Furgoneta', icon: BusFront },
  { id: 'MOTO', label: 'Moto', icon: Bike },
];

const obtenerDireccionDesdeCoordenadas = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GruApp/1.0'
        }
      }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

const obtenerRutaPorCalles = async (
  origen: [number, number],
  destino: [number, number]
): Promise<RutaInfo | null> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`
    );
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanciaKm = route.distance / 1000;
      const duracionMin = route.duration / 60;
      const coordenadas = route.geometry.coordinates.map((coord: [number, number]) => [
        coord[1],
        coord[0],
      ] as [number, number]);

      return {
        distancia: Math.round(distanciaKm * 10) / 10,
        duracion: Math.round(duracionMin),
        coordenadas,
      };
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo ruta:', error);
    return null;
  }
};

function MapClickHandler({ 
  onOrigenSet, 
  onDestinoSet,
  origenCoords,
  destinoCoords,
  servicioActivo 
}: { 
  onOrigenSet: (coords: [number, number], direccion: string) => void;
  onDestinoSet: (coords: [number, number], direccion: string) => void;
  origenCoords: [number, number];
  destinoCoords: [number, number] | null;
  servicioActivo: any;
}) {
  useMapEvents({
    click: async (e) => {
      if (servicioActivo) return;

      const { lat, lng } = e.latlng;
      const coords: [number, number] = [lat, lng];
      
      if (!origenCoords || (origenCoords[0] === -33.4489 && origenCoords[1] === -70.6693)) {
        toast.loading('Obteniendo dirección de origen...');
        const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
        toast.dismiss();
        toast.success('Origen establecido');
        onOrigenSet(coords, direccion);
      } 
      else if (!destinoCoords) {
        toast.loading('Obteniendo dirección de destino...');
        const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
        toast.dismiss();
        toast.success('Destino establecido');
        onDestinoSet(coords, direccion);
      }
      else {
        const actualizar = window.confirm('¿Actualizar destino? (Cancelar actualiza origen)');
        if (actualizar) {
          toast.loading('Obteniendo dirección de destino...');
          const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
          toast.dismiss();
          onDestinoSet(coords, direccion);
        } else {
          toast.loading('Obteniendo dirección de origen...');
          const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
          toast.dismiss();
          onOrigenSet(coords, direccion);
        }
      }
    },
  });

  return null;
}

function FitBoundsToRoute({ rutaCompleta }: { rutaCompleta: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (rutaCompleta.length > 0) {
      const bounds = new LatLngBounds(rutaCompleta);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [rutaCompleta, map]);

  return null;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function ClienteDashboard() {
  const { user } = useAuthStore();
  const { agregarNotificacion } = useNotificationStore();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<Sugerencia[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<Sugerencia[]>([]);
  const [mostrarSugerenciasOrigen, setMostrarSugerenciasOrigen] = useState(false);
  const [mostrarSugerenciasDestino, setMostrarSugerenciasDestino] = useState(false);
  const [tipoGrua, setTipoGrua] = useState('');
  const [gruasDisponibles, setGruasDisponibles] = useState<Grua[]>([]);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);
  const [historialServicios, setHistorialServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [precioEstimado, setPrecioEstimado] = useState<number>(0);
  const [distanciaKm, setDistanciaKm] = useState<number>(0);
  const [duracionEstimada, setDuracionEstimada] = useState<number>(0);
  const [rutaCompleta, setRutaCompleta] = useState<[number, number][]>([]);
  
  const [origenCoords, setOrigenCoords] = useState<[number, number]>([-33.4489, -70.6693]); // Santiago por defecto
  const [destinoCoords, setDestinoCoords] = useState<[number, number] | null>(null);
  const [ubicacionObtenida, setUbicacionObtenida] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [servicioParaCalificar, setServicioParaCalificar] = useState<Servicio | null>(null);

  const debounceTimerOrigen = useRef<ReturnType<typeof setTimeout>>();
  const debounceTimerDestino = useRef<ReturnType<typeof setTimeout>>();
  const socketRef = useRef<Socket | null>(null);

  const buscarSugerencias = async (texto: string, tipo: 'origen' | 'destino') => {
    if (texto.length < 3) {
      if (tipo === 'origen') setSugerenciasOrigen([]);
      else setSugerenciasDestino([]);
      return;
    }

    const timer = tipo === 'origen' ? debounceTimerOrigen : debounceTimerDestino;
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            texto + ', Santiago, Chile'
          )}&limit=5`,
          {
            headers: {
              'User-Agent': 'GruApp/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (tipo === 'origen') {
          setSugerenciasOrigen(data);
        } else {
          setSugerenciasDestino(data);
        }
      } catch (error) {
        console.error('Error buscando sugerencias:', error);
      }
    }, 500);
  };

  const seleccionarSugerencia = (sugerencia: Sugerencia, tipo: 'origen' | 'destino') => {
    const coords: [number, number] = [parseFloat(sugerencia.lat), parseFloat(sugerencia.lon)];
    
    if (tipo === 'origen') {
      setOrigen(sugerencia.display_name);
      setOrigenCoords(coords);
      setSugerenciasOrigen([]);
      setMostrarSugerenciasOrigen(false);
    } else {
      setDestino(sugerencia.display_name);
      setDestinoCoords(coords);
      setSugerenciasDestino([]);
      setMostrarSugerenciasDestino(false);
    }
  };

  const handleOrigenDrag = async (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    const coords: [number, number] = [lat, lng];
    setOrigenCoords(coords);
    
    toast.loading('Actualizando dirección de origen...');
    const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
    toast.dismiss();
    setOrigen(direccion);
  };

  const handleDestinoDrag = async (e: any) => {
    const { lat, lng } = e.target.getLatLng();
    const coords: [number, number] = [lat, lng];
    setDestinoCoords(coords);
    
    toast.loading('Actualizando dirección de destino...');
    const direccion = await obtenerDireccionDesdeCoordenadas(lat, lng);
    toast.dismiss();
    setDestino(direccion);
  };

  const calcularPrecio = (distancia: number) => {
    const tarifaBase = 25000;
    const tarifaPorKm = 1350;
    
    const total = tarifaBase + (distancia * tarifaPorKm);
    
    return Math.round(total);
  };

  // Obtener geolocalización del usuario al cargar
  useEffect(() => {
    if (!servicioActivo && !ubicacionObtenida) {
      console.log('📍 Solicitando geolocalización del usuario...');
      
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const coords: [number, number] = [latitude, longitude];
            
            console.log('✅ Ubicación obtenida:', coords);
            setOrigenCoords(coords);
            setUbicacionObtenida(true);
            
            // Obtener dirección de la ubicación actual
            toast.loading('Obteniendo tu ubicación...');
            const direccion = await obtenerDireccionDesdeCoordenadas(latitude, longitude);
            toast.dismiss();
            toast.success('Ubicación obtenida');
            setOrigen(direccion);
          },
          (error) => {
            console.error('❌ Error obteniendo geolocalización:', error);
            toast.error('No se pudo obtener tu ubicación. Usando Santiago por defecto.');
            setUbicacionObtenida(true);
            
            // Obtener dirección de Santiago por defecto
            obtenerDireccionDesdeCoordenadas(-33.4489, -70.6693).then(direccion => {
              setOrigen(direccion);
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        console.warn('⚠️ Geolocalización no disponible');
        toast.error('Tu navegador no soporta geolocalización');
        setUbicacionObtenida(true);
        
        // Usar Santiago por defecto
        obtenerDireccionDesdeCoordenadas(-33.4489, -70.6693).then(direccion => {
          setOrigen(direccion);
        });
      }
    }
  }, [servicioActivo, ubicacionObtenida]);

  useEffect(() => {
    console.log('🔌 [ClienteDashboard] Verificando socket global del Layout');
    
    // Esperar a que el socket global esté disponible
    const checkSocket = setInterval(() => {
      if (globalSocket) {
        console.log('✅ [ClienteDashboard] Socket global encontrado, configurando listeners');
        clearInterval(checkSocket);
        socketRef.current = globalSocket;

        globalSocket.on('cliente:gruasDisponibles', (gruas: Grua[]) => {
          console.log('📍 Grúas recibidas del servidor:', gruas);
          console.log('📊 Cantidad de grúas:', gruas.length);
          setGruasDisponibles(gruas);
        });

        globalSocket.on('gruero:disponible', (grua: Grua) => {
          console.log('🚛 Nueva grúa disponible (evento en tiempo real):', grua);
          setGruasDisponibles((prev) => {
            const existe = prev.find(g => g.id === grua.id);
            if (existe) {
              console.log('⚠️ Grúa ya existe en la lista');
              return prev;
            }
            console.log('➕ Agregando grúa a la lista');
            return [...prev, grua];
          });
          toast.success(`${grua.nombre} está disponible`, { icon: '🚛' });
        });

        globalSocket.on('gruero:statusUpdated', (data: { grueroId: string; status: string }) => {
          console.log('📡 Estado de grúa actualizado:', data);
          if (data.status === 'OFFLINE' || data.status === 'OCUPADO') {
            setGruasDisponibles((prev) => prev.filter(g => g.id !== data.grueroId));
          }
        });

        globalSocket.on('gruero:locationUpdated', (data: { grueroId: string; ubicacion: { lat: number; lng: number } }) => {
          console.log('📍 Ubicación de grúa actualizada:', data);
          setGruasDisponibles((prev) =>
            prev.map((grua) =>
              grua.id === data.grueroId ? { ...grua, ubicacion: data.ubicacion } : grua
            )
          );
        });

        globalSocket.on('cliente:servicioAceptado', (data: { servicioId: string; gruero: any }) => {
          console.log('✅ Servicio aceptado recibido:', data);
          cargarServicioActivo().then(() => {
            console.log('🔔 Abriendo modal por servicio aceptado');
            setShowNotification(true);
          });
        });

        globalSocket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string; servicio: any; gruero: any }) => {
          console.log('📢 Estado actualizado recibido:', data);
          console.log('📢 Servicio ID del evento:', data.servicioId);
          
          cargarServicioActivo().then(() => {
            console.log('🔔 Procesando cambio de estado:', data.status);
            
            if (data.status === 'COMPLETADO') {
              console.log('🎉 Servicio completado - Preparando modal de calificación');
              console.log('📦 Datos del servicio:', data.servicio);
              console.log('👤 Datos del gruero:', data.gruero);
              
              setServicioParaCalificar({
                id: data.servicio.id,
                origenDireccion: data.servicio.origenDireccion,
                destinoDireccion: data.servicio.destinoDireccion,
                distanciaKm: data.servicio.distanciaKm,
                totalCliente: data.servicio.totalCliente,
                pagado: data.servicio.pagado || false,
                status: 'COMPLETADO',
                createdAt: new Date().toISOString(),
                gruero: {
                  patente: data.gruero.patente,
                  marca: data.gruero.marca,
                  modelo: data.gruero.modelo,
                  capacidadToneladas: data.gruero.capacidad,
                  calificacionPromedio: data.gruero.calificacion,
                  user: {
                    nombre: data.gruero.nombre,
                    apellido: data.gruero.apellido,
                    telefono: data.gruero.telefono,
                  },
                },
              } as any);
              
              setShowNotification(false);
              setTimeout(() => {
                console.log('✨ Abriendo modal de calificación');
                setShowRatingModal(true);
              }, 300);
            } else {
              setTimeout(() => {
                setShowNotification(true);
              }, 100);
            }
          });
        });

        globalSocket.on('servicio:canceladoNotificacion', (data: { servicioId: string; canceladoPor: string; cliente: any; gruero: any }) => {
          console.log('🚫 Servicio cancelado recibido:', data);
          
          if (data.canceladoPor === 'GRUERO') {
            toast.error(`${data.gruero.nombre} canceló el servicio`, {
              duration: 5000,
              icon: '❌',
            });
          }
          
          setServicioActivo(null);
          setServicioParaCalificar(null);
          setShowNotification(false);
          setShowRatingModal(false);
          setOrigen('');
          setDestino('');
          setTipoGrua('');
          setOrigenCoords([-33.4489, -70.6693]);
          setDestinoCoords(null);
          setRutaCompleta([]);
          setPrecioEstimado(0);
          setDistanciaKm(0);
          setDuracionEstimada(0);
          cargarHistorial();
        });

        console.log('📤 Solicitando grúas disponibles al servidor...');
        globalSocket.emit('cliente:getGruasDisponibles');

        const interval = setInterval(() => {
          if (globalSocket.connected) {
            globalSocket.emit('cliente:getGruasDisponibles');
          }
        }, 10000);

        return () => {
          clearInterval(interval);
          // NO desconectar el socket global, solo limpiar listeners
          if (socketRef.current) {
            socketRef.current.off('cliente:gruasDisponibles');
            socketRef.current.off('gruero:disponible');
            socketRef.current.off('gruero:statusUpdated');
            socketRef.current.off('gruero:locationUpdated');
            socketRef.current.off('cliente:servicioAceptado');
            socketRef.current.off('cliente:estadoActualizado');
            socketRef.current.off('servicio:canceladoNotificacion');
          }
        };
      }
    }, 100);

    return () => {
      clearInterval(checkSocket);
    };
  }, [agregarNotificacion, user]);

  useEffect(() => {
    cargarServicioActivo();
    cargarHistorial();
  }, []);

  useEffect(() => {
    const calcularRutaYPrecio = async () => {
      if (origenCoords && destinoCoords) {
        const rutaInfo = await obtenerRutaPorCalles(origenCoords, destinoCoords);
        
        if (rutaInfo) {
          setDistanciaKm(rutaInfo.distancia);
          setDuracionEstimada(rutaInfo.duracion);
          setRutaCompleta(rutaInfo.coordenadas);
          setPrecioEstimado(calcularPrecio(rutaInfo.distancia));
        } else {
          const R = 6371;
          const dLat = ((destinoCoords[0] - origenCoords[0]) * Math.PI) / 180;
          const dLon = ((destinoCoords[1] - origenCoords[1]) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((origenCoords[0] * Math.PI) / 180) *
              Math.cos((destinoCoords[0] * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distancia = R * c * 1.3;

          setDistanciaKm(Math.round(distancia * 10) / 10);
          setRutaCompleta([origenCoords, destinoCoords]);
          setPrecioEstimado(calcularPrecio(distancia));
        }
      }
    };

    calcularRutaYPrecio();
  }, [origenCoords, destinoCoords]);

  const cargarServicioActivo = async () => {
    try {
      const response = await api.get('/servicios/activo');
      if (response.data.success && response.data.data) {
        setServicioActivo(response.data.data);
      } else {
        setServicioActivo(null);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setServicioActivo(null);
      } else {
        console.error('Error al cargar servicio activo:', error);
      }
    }
  };

  const cargarHistorial = async () => {
    try {
      const response = await api.get('/servicios/historial?limit=5');
      if (response.data.success) {
        setHistorialServicios(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error al cargar historial:', error);
      }
    }
  };

  const handleSolicitarServicio = async () => {
    if (!origen || !destino || !tipoGrua) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!origenCoords || !destinoCoords) {
      toast.error('Por favor selecciona origen y destino en el mapa');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/servicios/solicitar', {
        origenLat: origenCoords[0],
        origenLng: origenCoords[1],
        origenDireccion: origen,
        destinoLat: destinoCoords[0],
        destinoLng: destinoCoords[1],
        destinoDireccion: destino,
        observaciones: `Tipo de vehículo: ${tipoGrua}`,
      });

      if (response.data.success) {
        toast.success('¡Servicio solicitado! Buscando gruero...');
        setServicioActivo(response.data.data.servicio);
        cargarHistorial();
      }
    } catch (error: any) {
      console.error('Error al solicitar servicio:', error);
      toast.error(error.response?.data?.message || 'Error al solicitar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarServicio = async () => {
    if (!servicioActivo) return;

    const confirmar = window.confirm('¿Estás seguro de cancelar el servicio?');
    if (!confirmar) return;

    try {
      const response = await api.patch(`/servicios/${servicioActivo.id}/cancelar`);
      if (response.data.success) {
        toast.success('Servicio cancelado');
        
        if (socketRef.current) {
          socketRef.current.emit('servicio:cancelado', {
            servicioId: servicioActivo.id,
            canceladoPor: 'CLIENTE',
          });
        }
        
        setServicioActivo(null);
        setServicioParaCalificar(null);
        setShowNotification(false);
        setShowRatingModal(false);
        setOrigen('');
        setDestino('');
        setTipoGrua('');
        setOrigenCoords([-33.4489, -70.6693]);
        setDestinoCoords(null);
        setRutaCompleta([]);
        setPrecioEstimado(0);
        setDistanciaKm(0);
        setDuracionEstimada(0);
        cargarHistorial();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar servicio');
    }
  };

  const handleCompletarServicio = async () => {
    if (!servicioActivo) return;

    const confirmar = window.confirm('¿Confirmar que el servicio fue completado?');
    if (!confirmar) return;

    try {
      const response = await api.patch(`/servicios/${servicioActivo.id}/estado`, {
        status: 'COMPLETADO',
      });

      if (response.data.success) {
        toast.success('Servicio completado');
        
        if (socketRef.current) {
          socketRef.current.emit('servicio:estadoActualizado', {
            servicioId: servicioActivo.id,
            status: 'COMPLETADO',
          });
        }
      }
    } catch (error: any) {
      console.error('Error al completar servicio:', error);
      toast.error(error.response?.data?.message || 'Error al completar servicio');
    }
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    setServicioParaCalificar(null);
    
    setServicioActivo(null);
    setOrigen('');
    setDestino('');
    setTipoGrua('');
    setOrigenCoords([-33.4489, -70.6693]);
    setDestinoCoords(null);
    setRutaCompleta([]);
    setPrecioEstimado(0);
    setDistanciaKm(0);
    setDuracionEstimada(0);
    cargarHistorial();
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Modales */}
        {servicioActivo && servicioActivo.gruero && (
          <ServiceNotification
            isOpen={showNotification}
            onClose={() => setShowNotification(false)}
            gruero={{
              nombre: servicioActivo.gruero.user.nombre,
              apellido: servicioActivo.gruero.user.apellido,
              telefono: servicioActivo.gruero.user.telefono,
              patente: servicioActivo.gruero.patente,
              marca: servicioActivo.gruero.marca,
              modelo: servicioActivo.gruero.modelo,
              capacidad: servicioActivo.gruero.capacidadToneladas,
              calificacion: servicioActivo.gruero.calificacionPromedio,
            }}
            servicio={{
              status: servicioActivo.status,
              origenDireccion: servicioActivo.origenDireccion,
              destinoDireccion: servicioActivo.destinoDireccion,
              distanciaKm: servicioActivo.distanciaKm,
              totalCliente: servicioActivo.totalCliente,
            }}
          />
        )}

        {(servicioParaCalificar || servicioActivo) && (servicioParaCalificar?.gruero || servicioActivo?.gruero) && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={handleRatingClose}
            servicio={{
              id: (servicioParaCalificar || servicioActivo)!.id,
              origenDireccion: (servicioParaCalificar || servicioActivo)!.origenDireccion,
              destinoDireccion: (servicioParaCalificar || servicioActivo)!.destinoDireccion,
              distanciaKm: (servicioParaCalificar || servicioActivo)!.distanciaKm,
              totalCliente: (servicioParaCalificar || servicioActivo)!.totalCliente,
            }}
            gruero={{
              nombre: (servicioParaCalificar?.gruero || servicioActivo?.gruero)!.user.nombre,
              apellido: (servicioParaCalificar?.gruero || servicioActivo?.gruero)!.user.apellido,
              patente: (servicioParaCalificar?.gruero || servicioActivo?.gruero)!.patente,
              marca: (servicioParaCalificar?.gruero || servicioActivo?.gruero)!.marca,
              modelo: (servicioParaCalificar?.gruero || servicioActivo?.gruero)!.modelo,
            }}
          />
        )}

        {/* Panel Superior - Scroll horizontal en móvil */}
        <div className="bg-white border-b border-gray-200 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-3 md:p-4 min-w-max md:min-w-0">
            
            {/* Origen */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[280px] md:min-w-[320px] relative">
              <label className="block text-xs font-semibold text-gray-700 mb-2">📍 Origen</label>
              <input
                type="text"
                value={origen}
                onChange={(e) => {
                  setOrigen(e.target.value);
                  buscarSugerencias(e.target.value, 'origen');
                  setMostrarSugerenciasOrigen(true);
                }}
                onFocus={() => setMostrarSugerenciasOrigen(true)}
                onBlur={() => setTimeout(() => setMostrarSugerenciasOrigen(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Av. Providencia..."
                disabled={!!servicioActivo}
              />
              {mostrarSugerenciasOrigen && sugerenciasOrigen.length > 0 && (
                <div className="absolute z-50 w-[calc(100%-24px)] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {sugerenciasOrigen.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => seleccionarSugerencia(sug, 'origen')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs border-b last:border-0"
                    >
                      <MapPin className="inline h-3 w-3 mr-1 text-green-500" />
                      <span className="text-xs line-clamp-1">{sug.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destino */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[280px] md:min-w-[320px] relative">
              <label className="block text-xs font-semibold text-gray-700 mb-2">🎯 Destino</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  buscarSugerencias(e.target.value, 'destino');
                  setMostrarSugerenciasDestino(true);
                }}
                onFocus={() => setMostrarSugerenciasDestino(true)}
                onBlur={() => setTimeout(() => setMostrarSugerenciasDestino(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Av. Kennedy..."
                disabled={!!servicioActivo}
              />
              {mostrarSugerenciasDestino && sugerenciasDestino.length > 0 && (
                <div className="absolute z-50 w-[calc(100%-24px)] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {sugerenciasDestino.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => seleccionarSugerencia(sug, 'destino')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-xs border-b last:border-0"
                    >
                      <Navigation className="inline h-3 w-3 mr-1 text-orange-500" />
                      <span className="text-xs line-clamp-1">{sug.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tipo de Vehículo */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[240px]">
              <label className="block text-xs font-semibold text-gray-700 mb-2">🚗 Tipo de Vehículo</label>
              <div className="grid grid-cols-3 gap-1.5">
                {tiposVehiculos.map((tipo) => {
                  const IconComponent = tipo.icon;
                  return (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoGrua(tipo.id)}
                      disabled={!!servicioActivo}
                      className={`flex flex-col items-center p-2 rounded-lg border transition-all disabled:opacity-50 ${
                        tipoGrua === tipo.id ? 'border-[#ff7a3d] bg-orange-50' : 'border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-5 w-5 text-[#1e3a5f] mb-0.5" />
                      <span className="text-[10px] font-medium text-center">{tipo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumen / Estado */}
            {servicioActivo ? (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 min-w-[280px]">
                <p className="text-xs font-semibold text-blue-900 mb-2">📦 Servicio: {servicioActivo.status}</p>
                {servicioActivo.gruero && (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {servicioActivo.gruero.user.nombre} {servicioActivo.gruero.user.apellido}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => setShowNotification(true)}
                        className="flex-1 bg-[#ff7a3d] text-white rounded-lg py-1.5 text-xs font-semibold"
                      >
                        Ver Detalles
                      </button>
                      {servicioActivo.status === 'EN_SITIO' && (
                        <button 
                          onClick={handleCompletarServicio}
                          className="flex-1 bg-green-500 text-white rounded-lg py-1.5 text-xs font-semibold"
                        >
                          ✓ Completar
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleCancelarServicio}
                      className="w-full bg-red-500 text-white rounded-lg py-1.5 text-xs font-semibold mt-2"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            ) : destinoCoords ? (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[240px]">
                <p className="text-xs font-semibold text-gray-700 mb-2">💰 Resumen</p>
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Distancia:</span>
                    <span className="font-semibold">{distanciaKm} km</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tiempo:</span>
                    <span className="font-semibold">{duracionEstimada} min</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold">Total:</span>
                    <span className="text-lg font-bold text-[#ff7a3d]">
                      ${precioEstimado.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 min-w-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Sin destino</p>
                </div>
              </div>
            )}

            {/* Botón Solicitar / Grúas disponibles */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-3 min-w-[200px] flex flex-col justify-between">
              {!servicioActivo && (
                <>
                  <button
                    onClick={handleSolicitarServicio}
                    disabled={loading || !origen || !destino || !tipoGrua}
                    className="w-full bg-[#ff7a3d] text-white rounded-lg py-3 font-semibold disabled:opacity-50 flex items-center justify-center text-sm mb-2"
                  >
                    {loading ? <><Loader2 className="animate-spin h-4 w-4 mr-2" />Solicitando...</> : '🚛 Solicitar'}
                  </button>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-[#1e3a5f]">{gruasDisponibles.length}</span> grúas disponibles
                    </p>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mapa - Ocupa el resto de la pantalla */}
        <div className="flex-1 relative">
          <MapContainer 
            center={origenCoords} 
            zoom={13} 
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <RecenterMap position={origenCoords} />
            
            {rutaCompleta.length > 0 && <FitBoundsToRoute rutaCompleta={rutaCompleta} />}
            
            <MapClickHandler
              onOrigenSet={(coords, direccion) => {
                setOrigenCoords(coords);
                setOrigen(direccion);
              }}
              onDestinoSet={(coords, direccion) => {
                setDestinoCoords(coords);
                setDestino(direccion);
              }}
              origenCoords={origenCoords}
              destinoCoords={destinoCoords}
              servicioActivo={servicioActivo}
            />

            <Marker 
              position={origenCoords} 
              icon={clientIcon}
              draggable={!servicioActivo}
              eventHandlers={{
                dragend: handleOrigenDrag,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Origen</p>
                  <p className="text-gray-600">{origen || 'Tu ubicación'}</p>
                  {!servicioActivo && <p className="text-xs text-blue-600 mt-1">Arrastra para ajustar</p>}
                </div>
              </Popup>
            </Marker>

            {destinoCoords && (
              <>
                <Marker 
                  position={destinoCoords} 
                  icon={destinationIcon}
                  draggable={!servicioActivo}
                  eventHandlers={{
                    dragend: handleDestinoDrag,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Destino</p>
                      <p className="text-gray-600">{destino}</p>
                      {!servicioActivo && <p className="text-xs text-blue-600 mt-1">Arrastra para ajustar</p>}
                    </div>
                  </Popup>
                </Marker>
                
                {rutaCompleta.length > 0 && (
                  <Polyline 
                    positions={rutaCompleta} 
                    color="#ff7a3d" 
                    weight={5}
                    opacity={0.7}
                  />
                )}
              </>
            )}

            {gruasDisponibles.map((grua) => (
              <Marker key={grua.id} position={[grua.ubicacion.lat, grua.ubicacion.lng]} icon={gruaIcon}>
                <Popup maxWidth={300}>
                  <div className="p-2">
                    <div className="flex gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {grua.fotoGruero ? (
                          <img
                            src={grua.fotoGruero?.startsWith('http') 
                              ? grua.fotoGruero 
                              : `${API_URL.replace('/api', '')}${grua.fotoGruero}`
                            }
                            alt="Foto Gruero"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {grua.fotoGrua ? (
                          <img
                            src={grua.fotoGrua?.startsWith('http') 
                              ? grua.fotoGrua 
                              : `${API_URL.replace('/api', '')}${grua.fotoGrua}`
                            }
                            alt="Foto Grúa"
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Truck className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-[#1e3a5f]">{grua.nombre}</p>
                      
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-semibold">{grua.calificacion.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 ml-1">({grua.totalServicios} servicios)</span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        <Truck className="h-3 w-3 inline mr-1" />
                        {grua.marca} {grua.modelo}
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Capacidad: {grua.capacidad} ton
                      </p>
                      
                      <p className="text-sm text-gray-600">
                        Patente: <span className="font-semibold">{grua.patente}</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </Layout>
  );
}