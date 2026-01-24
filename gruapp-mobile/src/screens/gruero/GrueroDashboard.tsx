import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import { useNotificacionesStore } from '../../store/notificacionesStore'; // ✅ NUEVO
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import ServicioDisponibleModal from '../../components/ServicioDisponibleModal';
import * as Notifications from 'expo-notifications';
import { 
  registerForPushNotificationsAsync, 
  savePushTokenToBackend,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener 
} from '../../services/notifications';
import Toast from 'react-native-toast-message';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalGruero: number;
  totalCliente: number;
  tipoVehiculo: string;
  observaciones?: string;
  status: string;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
}

export default function GrueroDashboard() {
  const { user, logout } = useAuthStore();
  const { socket, connected } = useSocket();
  const agregarNotificacion = useNotificacionesStore((state) => state.agregarNotificacion); // ✅ NUEVO
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const [servicioDisponible, setServicioDisponible] = useState<Servicio | null>(null);
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [aceptandoServicio, setAceptandoServicio] = useState(false);
  
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);

  useEffect(() => {
    getLocation();
    checkDisponibilidad();
    cargarServicioActivo();
  }, []);

  // ✅ SOCKET LISTENERS CON NOTIFICACIONES
  useEffect(() => {
    if (!socket || !disponible) return;

    console.log('📡 Configurando listeners de gruero...');

    // ✅ Nuevo servicio disponible
    socket.on('nuevo-servicio', (data: any) => {
      console.log('Nuevo servicio disponible:', data);
      
      // ✅ NUEVO: Agregar notificación
      agregarNotificacion({
        tipo: 'NUEVO_SERVICIO',
        titulo: '🚗 Nuevo Servicio Disponible',
        mensaje: `${data.servicio.origenDireccion} → ${data.servicio.destinoDireccion}`,
        servicioId: data.servicio.id,
      });
      
      setServicioDisponible(data.servicio);
      setMostrarModalServicio(true);
    });

    // ✅ Servicio cancelado
    socket.on('servicio-cancelado', (data: any) => {
      console.log('🚫 Servicio cancelado:', data);
      
      if (data.canceladoPor === 'CLIENTE') {
        // ✅ NUEVO: Agregar notificación
        agregarNotificacion({
          tipo: 'SERVICIO_CANCELADO',
          titulo: '❌ Servicio Cancelado',
          mensaje: 'El cliente canceló el servicio',
          servicioId: data.servicioId,
        });
        
        Toast.show({
          type: 'error',
          text1: 'Servicio Cancelado',
          text2: 'El cliente canceló el servicio',
          position: 'top',
          visibilityTime: 3000,
        });
      }
      
      if (servicioDisponible && servicioDisponible.id === data.servicioId) {
        setMostrarModalServicio(false);
        setServicioDisponible(null);
      }
      
      setServicioActivo(null);
    });

    // ✅ Estado actualizado por cliente
    socket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string }) => {
      console.log('📢 Estado actualizado por cliente:', data);
      
      if (data.status === 'COMPLETADO') {
        // ✅ NUEVO: Agregar notificación
        agregarNotificacion({
          tipo: 'SERVICIO_COMPLETADO',
          titulo: '✅ Servicio Completado',
          mensaje: 'El cliente marcó el servicio como completado',
          servicioId: data.servicioId,
        });
        
        Toast.show({
          type: 'success',
          text1: 'Servicio Completado',
          text2: 'El cliente marcó el servicio como completado',
          position: 'top',
          visibilityTime: 3000,
        });
        setServicioActivo(null);
      } else {
        cargarServicioActivo();
      }
    });

    return () => {
      socket.off('nuevo-servicio');
      socket.off('servicio-cancelado');
      socket.off('cliente:estadoActualizado');
    };
  }, [socket, disponible, servicioDisponible]);

  // 📱 CONFIGURAR NOTIFICACIONES PUSH
  useEffect(() => {
    const setupNotifications = async () => {
      if (!user?.id) return;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await savePushTokenToBackend(user.id, token, 'GRUERO');
      }

      const receivedSubscription = addNotificationReceivedListener(notification => {
        console.log('Notificación recibida:', notification);
      });

      const responseSubscription = addNotificationResponseReceivedListener(response => {
        console.log('Usuario tocó notificación:', response);
        const data = response.notification.request.content.data;
        
        if (data.tipo === 'NUEVO_SERVICIO' && data.servicio) {
          setServicioDisponible(data.servicio);
          setMostrarModalServicio(true);
        }
      });

      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    };

    setupNotifications();
  }, [user?.id]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permiso Requerido',
          text2: 'Necesitamos acceso a tu ubicación para que los clientes te encuentren',
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

      if (disponible) {
        await updateLocationOnServer(newLocation);
      }

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

  const checkDisponibilidad = async () => {
    try {
      const response = await api.get('/gruero/perfil');
      if (response.data.success) {
        const status = response.data.data.status;
        setDisponible(status === 'DISPONIBLE');
      }
    } catch (error: any) {
      console.error('Error obteniendo disponibilidad:', error);
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

  const updateLocationOnServer = async (loc: { latitude: number; longitude: number }) => {
    try {
      await api.put('/gruero/location', {
        latitud: loc.latitude,
        longitud: loc.longitude,
        status: 'DISPONIBLE',
      });

      if (socket && user?.id) {
        socket.emit('gruero:locationUpdated', {
          grueroId: user.id,
          ubicacion: {
            lat: loc.latitude,
            lng: loc.longitude,
          },
        });
      }
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
    }
  };

  const toggleDisponibilidad = async () => {
    try {
      setUpdatingStatus(true);
      const nuevoEstado = !disponible;

      const response = await api.patch('/gruero/disponibilidad', {
        disponible: nuevoEstado,
      });

      if (response.data.success) {
        setDisponible(nuevoEstado);

        if (nuevoEstado && location) {
          await updateLocationOnServer(location);
        }

        Toast.show({
          type: nuevoEstado ? 'success' : 'info',
          text1: 'Estado Actualizado',
          text2: nuevoEstado 
            ? 'Ahora estás DISPONIBLE y visible para clientes'
            : 'Ahora estás OFFLINE y no recibirás solicitudes',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      console.error('Error cambiando disponibilidad:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo actualizar el estado',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const aceptarServicio = async () => {
    if (!servicioDisponible) return;

    try {
      setAceptandoServicio(true);
      const response = await api.post(`/servicios/${servicioDisponible.id}/aceptar`);

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Servicio Aceptado',
          text2: 'El cliente ha sido notificado. Dirígete al punto de origen.',
          position: 'top',
          visibilityTime: 4000,
        });
        
        if (socket) {
          socket.emit('servicio:aceptado', {
            servicioId: servicioDisponible.id,
          });
        }

        setMostrarModalServicio(false);
        setServicioDisponible(null);
        
        cargarServicioActivo();
      }
    } catch (error: any) {
      console.error('Error aceptando servicio:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo aceptar el servicio',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setAceptandoServicio(false);
    }
  };

  const rechazarServicio = () => {
  // ✅ Cerrar modal inmediatamente
  setMostrarModalServicio(false);
  setServicioDisponible(null);
  
  // ✅ Mostrar notificación de rechazo
  Toast.show({
    type: 'info',
    text1: 'Servicio Rechazado',
    text2: 'Has rechazado el servicio',
    position: 'top',
    visibilityTime: 2000,
  });
  
  console.log('❌ Servicio rechazado');
};

  const actualizarEstadoServicio = async (nuevoEstado: string) => {
    if (!servicioActivo) return;

    try {
      const response = await api.patch(`/servicios/${servicioActivo.id}/estado`, {
        status: nuevoEstado,
      });

      if (response.data.success) {
        if (socket) {
          socket.emit('servicio:estadoActualizado', {
            servicioId: servicioActivo.id,
            status: nuevoEstado,
          });
        }

        const mensajes: Record<string, { text1: string; text2: string }> = {
          EN_CAMINO: { text1: 'Estado Actualizado', text2: 'En Camino al origen' },
          EN_SITIO: { text1: 'Estado Actualizado', text2: 'Has llegado al sitio' },
          COMPLETADO: { text1: 'Servicio Completado', text2: 'El servicio ha sido marcado como completado' },
        };

        if (mensajes[nuevoEstado]) {
          Toast.show({
            type: 'success',
            text1: mensajes[nuevoEstado].text1,
            text2: mensajes[nuevoEstado].text2,
            position: 'top',
            visibilityTime: 3000,
          });
        }
        
        if (nuevoEstado === 'COMPLETADO') {
          // ✅ NUEVO: Agregar notificación de servicio completado
          agregarNotificacion({
            tipo: 'SERVICIO_COMPLETADO',
            titulo: '✅ Servicio Completado',
            mensaje: `Has completado el servicio. Ganancia: $${servicioActivo.totalGruero.toLocaleString('es-CL')}`,
            servicioId: servicioActivo.id,
          });
          
          setServicioActivo(null);
        } else {
          cargarServicioActivo();
        }
      }
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar el estado',
        position: 'top',
        visibilityTime: 3000,
      });
    }
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre}!</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: connected ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.connectionText}>
              {disponible ? 'DISPONIBLE' : 'OFFLINE'} • {connected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusInfo}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: disponible ? '#10b981' : '#6b7280' }
          ]} />
          <Text style={styles.statusText}>
            {disponible ? 'DISPONIBLE' : 'OFFLINE'}
          </Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {disponible ? 'Desactivar' : 'Activar'}
          </Text>
          <Switch
            value={disponible}
            onValueChange={toggleDisponibilidad}
            disabled={updatingStatus}
            trackColor={{ false: '#d1d5db', true: '#10b981' }}
            thumbColor={disponible ? '#fff' : '#f3f4f6'}
          />
        </View>
      </View>

      {servicioActivo && (
        <View style={styles.servicioActivoContainer}>
          <Text style={styles.servicioActivoTitle}>
            {servicioActivo.status === 'ACEPTADO' && 'Servicio Aceptado'}
            {servicioActivo.status === 'EN_CAMINO' && 'En Camino'}
            {servicioActivo.status === 'EN_SITIO' && 'En el Sitio'}
          </Text>
          
          <View style={styles.servicioInfo}>
            <Text style={styles.clienteNombre}>
              {servicioActivo.cliente.user.nombre} {servicioActivo.cliente.user.apellido}
            </Text>
            <Text style={styles.direccion}>📍 {servicioActivo.origenDireccion}</Text>
            <Text style={styles.direccion}>🎯 {servicioActivo.destinoDireccion}</Text>
            <Text style={styles.ganancia}>
              ${servicioActivo.totalGruero.toLocaleString('es-CL')}
            </Text>
          </View>

          <View style={styles.accionesContainer}>
            {servicioActivo.status === 'ACEPTADO' && (
              <TouchableOpacity
                style={[styles.accionButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => actualizarEstadoServicio('EN_CAMINO')}
              >
                <Text style={styles.accionButtonText}>🚗 En Camino</Text>
              </TouchableOpacity>
            )}
            
            {servicioActivo.status === 'EN_CAMINO' && (
              <TouchableOpacity
                style={[styles.accionButton, { backgroundColor: '#8b5cf6' }]}
                onPress={() => actualizarEstadoServicio('EN_SITIO')}
              >
                <Text style={styles.accionButtonText}>📍 En Sitio</Text>
              </TouchableOpacity>
            )}
            
            {servicioActivo.status === 'EN_SITIO' && (
              <TouchableOpacity
                style={[styles.accionButton, { backgroundColor: '#10b981' }]}
                onPress={() => actualizarEstadoServicio('COMPLETADO')}
              >
                <Text style={styles.accionButtonText}>✅ Completar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.latitude || -33.4489,
            longitude: location?.longitude || -70.6693,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {location && disponible && (
            <Marker
              coordinate={location}
              title="Tu ubicación"
              description="Visible para clientes"
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={getLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        {!disponible ? (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              Activa tu disponibilidad para recibir solicitudes de clientes
            </Text>
          </View>
        ) : !servicioActivo ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.statLabel}>Esperando solicitudes...</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={20} color={colors.success} />
              <Text style={styles.statLabel}>Ubicación visible</Text>
            </View>
          </View>
        ) : null}
      </View>

      <ServicioDisponibleModal
        visible={mostrarModalServicio}
        servicio={servicioDisponible}
        onAceptar={aceptarServicio}
        onRechazar={rechazarServicio}
        loading={aceptandoServicio}
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
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.border },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusIndicator: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 16, fontWeight: '600', color: colors.secondary },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  switchLabel: { fontSize: 14, color: colors.text.secondary },
  servicioActivoContainer: { backgroundColor: '#fff', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  servicioActivoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.secondary, marginBottom: spacing.sm },
  servicioInfo: { backgroundColor: '#f0f9ff', padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  clienteNombre: { fontSize: 16, fontWeight: '600', color: colors.secondary, marginBottom: 4 },
  direccion: { fontSize: 13, color: colors.text.secondary, marginBottom: 2 },
  ganancia: { fontSize: 18, fontWeight: 'bold', color: '#16a34a', marginTop: 8 },
  accionesContainer: { flexDirection: 'row', gap: spacing.sm },
  accionButton: { flex: 1, padding: spacing.md, borderRadius: 8, alignItems: 'center' },
  accionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  centerButton: { position: 'absolute', top: spacing.md, right: spacing.md, backgroundColor: '#fff', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  bottomContainer: { backgroundColor: '#fff', padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: '#f3f4f6', borderRadius: 8 },
  infoText: { flex: 1, fontSize: 14, color: colors.text.secondary },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statLabel: { fontSize: 12, color: colors.text.secondary },
});