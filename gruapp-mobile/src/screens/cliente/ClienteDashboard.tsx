import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeafletMap, { Marker, Polyline, LeafletMapRef } from '../../components/LeafletMap';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import { useNotificacionesStore } from '../../store/notificacionesStore';
import { colors, spacing } from '../../theme/colors';
import SolicitarServicioModal from '../../components/SolicitarServicioModal';
import ServicioCompletadoModal from '../../components/ServicioCompletadoModal';
import api from '../../services/api';
import { RoutingService } from '../../services/routing.service';
import { GeocodingService } from '../../services/geocoding.service';
import Toast from 'react-native-toast-message';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  origenLat: number;
  origenLng: number;
  destinoLat: number;
  destinoLng: number;
  status: string;
  totalCliente: number;
  distanciaKm: number;
  gruero?: {
    id?: string;
    latitud?: number;
    longitud?: number;
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
    patente: string;
    marca: string;
    modelo: string;
  };
}

export default function ClienteDashboard() {
  const { user, logout } = useAuthStore();
  const { socket, connected } = useSocket();
  const agregarNotificacion = useNotificacionesStore((state) => state.agregarNotificacion);
  const mapRef = useRef<LeafletMapRef>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [mostrarModalCompletado, setMostrarModalCompletado] = useState(false);
  const [gruerosDisponibles, setGruerosDisponibles] = useState<any[]>([]);
  const [grueroAsignadoUbicacion, setGrueroAsignadoUbicacion] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Estados para selección de destino en el mapa
  const [modoSeleccionDestino, setModoSeleccionDestino] = useState(false);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<{
    latitude: number;
    longitude: number;
    direccion: string;
  } | null>(null);

  useEffect(() => {
    getLocation();
    cargarServicioActivo();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    console.log('Configurando listeners de cliente...');

    socket.on('cliente:servicioAceptado', (data: any) => {
      console.log('Servicio aceptado:', data);

      if (data.gruero?.latitud && data.gruero?.longitud) {
        console.log('Seteando ubicación inicial del gruero desde socket');
        setGrueroAsignadoUbicacion({
          latitude: data.gruero.latitud,
          longitude: data.gruero.longitud,
        });
      }

      agregarNotificacion({
        tipo: 'SERVICIO_ACEPTADO',
        titulo: '¡Gruero en Camino!',
        mensaje: `${data.gruero?.user?.nombre || 'Un gruero'} aceptó tu solicitud`,
        servicioId: data.servicioId,
      });

      Toast.show({
        type: 'success',
        text1: '¡Gruero en Camino!',
        text2: `${data.gruero?.user?.nombre || 'Un gruero'} aceptó tu solicitud`,
        position: 'top',
        visibilityTime: 4000,
      });
      cargarServicioActivo();
    });

    socket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string; servicio?: any; gruero?: any }) => {
      console.log('Estado actualizado:', data);
      
      const mensajes: Record<string, { text1: string; text2: string }> = {
        EN_CAMINO: { text1: 'Gruero en Camino', text2: 'El gruero está en camino' },
        EN_SITIO: { text1: 'Gruero Llegó', text2: 'El gruero llegó al lugar' },
        COMPLETADO: { text1: 'Servicio Completado', text2: 'El servicio ha sido completado' },
      };

      if (mensajes[data.status]) {
        agregarNotificacion({
          tipo: 'ESTADO_ACTUALIZADO',
          titulo: mensajes[data.status].text1,
          mensaje: mensajes[data.status].text2,
          servicioId: data.servicioId,
        });

        Toast.show({
          type: 'info',
          text1: mensajes[data.status].text1,
          text2: mensajes[data.status].text2,
          position: 'top',
          visibilityTime: 3000,
        });
      }

      if (data.status === 'COMPLETADO') {
        if (data.servicio && data.gruero) {
          setServicioActivo({
            id: data.servicioId,
            origenDireccion: data.servicio.origenDireccion,
            destinoDireccion: data.servicio.destinoDireccion,
            origenLat: 0,
            origenLng: 0,
            destinoLat: 0,
            destinoLng: 0,
            status: 'COMPLETADO',
            totalCliente: data.servicio.totalCliente,
            distanciaKm: data.servicio.distanciaKm,
            gruero: {
              user: {
                nombre: data.gruero.nombre,
                apellido: data.gruero.apellido,
                telefono: data.gruero.telefono,
              },
              patente: data.gruero.patente,
              marca: data.gruero.marca,
              modelo: data.gruero.modelo,
            },
          });
        }
        
        setMostrarModalCompletado(true);
      } else {
        cargarServicioActivo();
      }
    });

    socket.on('servicio:canceladoNotificacion', (data: any) => {
      console.log('Servicio cancelado:', data);
      
      if (data.canceladoPor === 'GRUERO') {
        agregarNotificacion({
          tipo: 'SERVICIO_CANCELADO',
          titulo: 'Servicio Cancelado',
          mensaje: 'El gruero canceló el servicio. Puedes solicitar otro.',
          servicioId: data.servicioId,
        });

        Toast.show({
          type: 'error',
          text1: 'Servicio Cancelado',
          text2: 'El gruero canceló el servicio. Puedes solicitar otro.',
          position: 'top',
          visibilityTime: 4000,
        });
      }
      
      setServicioActivo(null);
      setRouteCoordinates([]);
      setGrueroAsignadoUbicacion(null);
    });

    socket.on('cliente:gruasDisponibles', (gruas: any[]) => {
      console.log('Grueros disponibles recibidos:', gruas.length);
      setGruerosDisponibles(gruas);
    });

    socket.on('gruero:disponible', (grua: any) => {
      console.log('Nuevo gruero disponible:', grua);
      setGruerosDisponibles(prev => {
        const exists = prev.find(g => g.id === grua.id);
        if (exists) {
          return prev.map(g => g.id === grua.id ? grua : g);
        }
        return [...prev, grua];
      });
    });

    socket.on('gruero:locationUpdated', (data: { grueroId: string; ubicacion: { lat: number; lng: number } }) => {
      console.log('Ubicación gruero actualizada:', data);
      
      if (servicioActivo && servicioActivo.gruero?.id === data.grueroId) {
        console.log('Actualizando ubicación del gruero asignado');
        setGrueroAsignadoUbicacion({
          latitude: data.ubicacion.lat,
          longitude: data.ubicacion.lng,
        });
      }
      
      setGruerosDisponibles(prev =>
        prev.map(g => g.id === data.grueroId
          ? { ...g, ubicacion: data.ubicacion }
          : g
        )
      );
    });

    socket.on('gruero:desconectado', (data: { grueroId: string }) => {
      console.log('Gruero desconectado:', data.grueroId);
      setGruerosDisponibles(prev => prev.filter(g => g.id !== data.grueroId));
    });

    socket.on('gruero:statusUpdated', (data: { grueroId: string; status: string }) => {
      console.log('🔄 Estado de gruero actualizado:', data);
      
      if (data.status === 'DISPONIBLE') {
        console.log('Gruero ahora DISPONIBLE:', data.grueroId);
        solicitarGruerosDisponibles();
      } else if (data.status === 'OFFLINE' || data.status === 'OCUPADO') {
        console.log('Gruero ahora OFFLINE/OCUPADO:', data.grueroId);
        setGruerosDisponibles(prev => prev.filter(g => g.id !== data.grueroId));
      }
    });

    if (connected) {
      solicitarGruerosDisponibles();
    }

    return () => {
      socket.off('cliente:servicioAceptado');
      socket.off('cliente:estadoActualizado');
      socket.off('servicio:canceladoNotificacion');
      socket.off('cliente:gruasDisponibles');
      socket.off('gruero:disponible');
      socket.off('gruero:locationUpdated');
      socket.off('gruero:desconectado');
      socket.off('gruero:statusUpdated');
    };
  }, [socket, connected, servicioActivo]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permiso Requerido',
          text2: 'Necesitamos acceso a tu ubicación para mostrarte grueros cercanos',
          position: 'top',
          visibilityTime: 4000,
        });
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(newLocation);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener tu ubicación',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const solicitarGruerosDisponibles = () => {
    if (socket && connected) {
      console.log('Solicitando grueros disponibles...');
      socket.emit('cliente:getGruasDisponibles');
    }
  };

  const cargarRuta = async (servicio: Servicio) => {
    try {
      console.log('Calculando ruta...');
      const route = await RoutingService.getRoute(
        { latitude: servicio.origenLat, longitude: servicio.origenLng },
        { latitude: servicio.destinoLat, longitude: servicio.destinoLng }
      );

      if (route) {
        console.log(`Ruta calculada: ${route.distance.toFixed(2)} km, ${Math.round(route.duration)} min`);
        setRouteCoordinates(route.coordinates);

        if (mapRef.current && route.coordinates.length > 0) {
          mapRef.current.fitToCoordinates(route.coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          });
        }
      } else {
        setRouteCoordinates([]);
      }
    } catch (error) {
      console.error('Error calculando ruta:', error);
      setRouteCoordinates([]);
    }
  };

  const cargarServicioActivo = async () => {
    try {
      console.log('Cargando servicio activo...');
      const response = await api.get('/servicios/activo');
      console.log('Respuesta servicio activo:', response.data);
      
      if (response.data.success && response.data.data) {
        const servicio = response.data.data;
        setServicioActivo(servicio);
        console.log('Servicio activo cargado:', servicio);
        
        await cargarRuta(servicio);
        
        if (servicio.gruero?.latitud && servicio.gruero?.longitud && servicio.status !== 'SOLICITADO') {
          console.log('Seteando ubicación inicial del gruero desde servicio activo');
          setGrueroAsignadoUbicacion({
            latitude: servicio.gruero.latitud,
            longitude: servicio.gruero.longitud,
          });
        }
      } else {
        setServicioActivo(null);
        setRouteCoordinates([]);
        setGrueroAsignadoUbicacion(null);
        console.log('ℹNo hay servicio activo');
      }
    } catch (error: any) {
      console.error('Error cargando servicio activo:', error.response?.data || error.message);
      if (error.response?.status !== 404) {
        console.error('Error completo:', error);
      }
      setServicioActivo(null);
      setRouteCoordinates([]);
      setGrueroAsignadoUbicacion(null);
    }
  };

  const activarSeleccionDestino = () => {
    setModoSeleccionDestino(true);
    setDestinoSeleccionado(null);
    Toast.show({
      type: 'info',
      text1: '📍 Selecciona el Destino',
      text2: 'Toca en el mapa donde quieres ir',
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleMapPress = async (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    if (!modoSeleccionDestino) return;

    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    Toast.show({
      type: 'info',
      text1: 'Obteniendo dirección...',
      text2: 'Por favor espera',
      position: 'top',
      visibilityTime: 2000,
    });

    try {
      const direccion = await GeocodingService.reverseGeocode(latitude, longitude);
      
      setDestinoSeleccionado({
        latitude,
        longitude,
        direccion,
      });

      Toast.show({
        type: 'success',
        text1: '✅ Destino Seleccionado',
        text2: direccion.substring(0, 50) + '...',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener la dirección',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const confirmarDestino = () => {
    if (!destinoSeleccionado) return;
    
    setModoSeleccionDestino(false);
    setModalVisible(true);
  };

  const cancelarSeleccionDestino = () => {
    setModoSeleccionDestino(false);
    setDestinoSeleccionado(null);
  };

  const cancelarServicio = () => {
    if (!servicioActivo) return;

    Toast.show({
      type: 'error',
      text1: '¿Cancelar Servicio?',
      text2: 'Presiona para confirmar',
      position: 'top',
      visibilityTime: 3000,
      onPress: async () => {
        try {
          const response = await api.patch(`/servicios/${servicioActivo.id}/cancelar`);
          
          if (response.data.success) {
            if (socket) {
              socket.emit('servicio:cancelado', {
                servicioId: servicioActivo.id,
                canceladoPor: 'CLIENTE',
              });
            }
            
            Toast.show({
              type: 'success',
              text1: 'Servicio Cancelado',
              text2: 'El servicio ha sido cancelado correctamente',
              position: 'top',
              visibilityTime: 3000,
            });
            
            setServicioActivo(null);
            setRouteCoordinates([]);
            setGrueroAsignadoUbicacion(null);
          }
        } catch (error: any) {
          console.error('Error cancelando servicio:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo cancelar el servicio',
            position: 'top',
            visibilityTime: 3000,
          });
        }
      },
    });
  };

  const marcarComoCompletado = () => {
    if (!servicioActivo) return;

    Toast.show({
      type: 'info',
      text1: '¿Completar Servicio?',
      text2: 'Presiona para confirmar',
      position: 'top',
      visibilityTime: 3000,
      onPress: async () => {
        try {
          const response = await api.patch(`/servicios/${servicioActivo.id}/estado`, {
            status: 'COMPLETADO',
          });
          
          if (response.data.success) {
            if (socket) {
              socket.emit('servicio:estadoActualizado', {
                servicioId: servicioActivo.id,
                status: 'COMPLETADO',
              });
            }
            
            setMostrarModalCompletado(true);
          }
        } catch (error: any) {
          console.error('Error completando servicio:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo completar el servicio',
            position: 'top',
            visibilityTime: 3000,
          });
        }
      },
    });
  };

  const handleLogout = () => {
    Toast.show({
      type: 'error',
      text1: '¿Cerrar Sesión?',
      text2: 'Presiona para confirmar',
      position: 'top',
      visibilityTime: 3000,
      onPress: () => logout(),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre}! </Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: connected ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.connectionText}>
              {connected ? 'Conectado' : 'Desconectado'}
            </Text>
            {(!servicioActivo || servicioActivo.status === 'SOLICITADO') && gruerosDisponibles.length > 0 && (
              <Text style={styles.connectionText}>
                • {gruerosDisponibles.length} {gruerosDisponibles.length === 1 ? 'grúa' : 'grúas'} cerca
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Banner de modo selección */}
      {modoSeleccionDestino && (
        <View style={styles.seleccionBanner}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.seleccionBannerText}>
            Toca en el mapa para seleccionar el destino
          </Text>
        </View>
      )}

      {/* Servicio Activo */}
      {servicioActivo && (
        <View style={styles.servicioActivoContainer}>
          <View style={styles.servicioActivoHeader}>
            <Text style={styles.servicioActivoTitle}>
              {servicioActivo.status === 'SOLICITADO' && 'Buscando Gruero...'}
              {servicioActivo.status === 'ACEPTADO' && 'Gruero Asignado'}
              {servicioActivo.status === 'EN_CAMINO' && 'Gruero en Camino'}
              {servicioActivo.status === 'EN_SITIO' && 'Gruero en el Lugar'}
            </Text>
          </View>

          {servicioActivo.gruero && (
            <View style={styles.grueroInfo}>
              <Text style={styles.grueroNombre}>
                {servicioActivo.gruero.user.nombre} {servicioActivo.gruero.user.apellido}
              </Text>
              <Text style={styles.grueroVehiculo}>
                {servicioActivo.gruero.marca} {servicioActivo.gruero.modelo} - {servicioActivo.gruero.patente}
              </Text>
              {servicioActivo.gruero.user.telefono && (
                <TouchableOpacity
                  style={styles.phoneButton}
                  onPress={() => {/* Implementar llamada */}}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={styles.phoneText}>{servicioActivo.gruero.user.telefono}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.servicioAcciones}>
            {servicioActivo.status === 'EN_SITIO' && (
              <TouchableOpacity
                style={styles.completarButton}
                onPress={marcarComoCompletado}
              >
                <Text style={styles.completarButtonText}>✅ Marcar como Completado</Text>
              </TouchableOpacity>
            )}
            
            {servicioActivo.status === 'SOLICITADO' && (
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={cancelarServicio}
              >
                <Text style={styles.cancelarButtonText}>Cancelar Servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <LeafletMap
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location?.latitude || -33.4489,
            longitude: location?.longitude || -70.6693,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
        >
          {/* Ubicación del usuario */}
          {location && (
            <Marker
              key="my-location"
              coordinate={location}
              title="Tu ubicación"
              pinColor={colors.primary}
            />
          )}

          {/* Destino seleccionado en el mapa */}
          {destinoSeleccionado && (
            <Marker
              key="destino-seleccionado"
              coordinate={{
                latitude: destinoSeleccionado.latitude,
                longitude: destinoSeleccionado.longitude,
              }}
              title="Destino seleccionado"
              description={destinoSeleccionado.direccion}
              pinColor="#ef4444"
            />
          )}

          {/* Grueros disponibles cercanos (markers custom con GruaIcon) */}
          {(!servicioActivo || servicioActivo.status === 'SOLICITADO') && gruerosDisponibles.map((gruero) => (
            <Marker
              key={`gruero-${gruero.id}`}
              coordinate={{
                latitude: gruero.ubicacion.lat,
                longitude: gruero.ubicacion.lng,
              }}
              title={gruero.nombre}
              description={`${gruero.marca} ${gruero.modelo} - ${gruero.patente}`}
              _customIcon="grua"
            />
          ))}

          {/* Gruero asignado al servicio activo */}
          {servicioActivo && servicioActivo.status !== 'SOLICITADO' && grueroAsignadoUbicacion && (
            <Marker
              key="gruero-asignado"
              coordinate={grueroAsignadoUbicacion}
              title={`${servicioActivo.gruero?.user.nombre} ${servicioActivo.gruero?.user.apellido}`}
              description="Tu gruero asignado"
              _customIcon="grua-assigned"
            />
          )}

          {/* Destino del servicio activo */}
          {servicioActivo && (
            <Marker
              key="destino-servicio"
              coordinate={{
                latitude: servicioActivo.destinoLat,
                longitude: servicioActivo.destinoLng,
              }}
              title="Destino"
              description={servicioActivo.destinoDireccion}
              pinColor="#ef4444"
            />
          )}

          {/* Ruta origen → destino */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={6}
              strokeColor="#FF7A3D"
            />
          )}
        </LeafletMap>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={getLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Botones de confirmación cuando se selecciona destino */}
      {modoSeleccionDestino && destinoSeleccionado && (
        <View style={styles.confirmacionContainer}>
          <View style={styles.destinoInfo}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={styles.destinoTexto} numberOfLines={2}>
              {destinoSeleccionado.direccion}
            </Text>
          </View>
          <View style={styles.confirmacionBotones}>
            <TouchableOpacity
              style={styles.cancelarSeleccionButton}
              onPress={cancelarSeleccionDestino}
            >
              <Text style={styles.cancelarSeleccionText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmarButton}
              onPress={confirmarDestino}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.confirmarButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!servicioActivo && !modoSeleccionDestino && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="car-sport" size={28} color="#fff" />
            <Text style={styles.requestButtonText}>Solicitar Grúa</Text>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Respuesta en minutos</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Grueros verificados</Text>
            </View>
          </View>
        </View>
      )}

      <SolicitarServicioModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setDestinoSeleccionado(null);
        }}
        onSelectDestinationOnMap={activarSeleccionDestino}
        ubicacionActual={location}
        destinoSeleccionadoMapa={destinoSeleccionado}
        onSuccess={() => {
          console.log('🎉 Servicio solicitado exitosamente, recargando...');
          setDestinoSeleccionado(null);
          cargarServicioActivo();
        }}
      />

      <ServicioCompletadoModal
        visible={mostrarModalCompletado}
        servicio={servicioActivo}
        onClose={() => {
          setMostrarModalCompletado(false);
          setServicioActivo(null);
          setRouteCoordinates([]);
          setGrueroAsignadoUbicacion(null);
          cargarServicioActivo();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: spacing.md, color: colors.text.secondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  greeting: { fontSize: 20, fontWeight: 'bold', color: colors.secondary },
  connectionStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  connectionIndicator: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 12, color: colors.text.secondary },
  logoutButton: { padding: spacing.xs },
  seleccionBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#f0f9ff', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#bfdbfe' },
  seleccionBannerText: { flex: 1, fontSize: 14, color: colors.primary, fontWeight: '600' },
  servicioActivoContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border, padding: spacing.md },
  servicioActivoHeader: { marginBottom: spacing.sm },
  servicioActivoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.secondary },
  grueroInfo: { backgroundColor: '#f0f9ff', padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  grueroNombre: { fontSize: 16, fontWeight: '600', color: colors.secondary },
  grueroVehiculo: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  phoneButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  phoneText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  servicioAcciones: { flexDirection: 'row', gap: spacing.sm },
  completarButton: { flex: 1, backgroundColor: colors.success, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  completarButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelarButton: { flex: 1, backgroundColor: colors.error, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  cancelarButtonText: { color: '#fff', fontWeight: 'bold' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  centerButton: { position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: '#fff', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  confirmacionContainer: { backgroundColor: '#fff', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  destinoInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md, padding: spacing.md, backgroundColor: '#f0f9ff', borderRadius: 8 },
  destinoTexto: { flex: 1, fontSize: 14, color: colors.text.primary, lineHeight: 20 },
  confirmacionBotones: { flexDirection: 'row', gap: spacing.sm },
  cancelarSeleccionButton: { flex: 1, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 8, alignItems: 'center' },
  cancelarSeleccionText: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  confirmarButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, padding: spacing.md, backgroundColor: colors.primary, borderRadius: 8 },
  confirmarButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  bottomContainer: { backgroundColor: '#fff', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  requestButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: 12, gap: spacing.sm, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  requestButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  infoText: { fontSize: 12, color: colors.text.secondary },
});