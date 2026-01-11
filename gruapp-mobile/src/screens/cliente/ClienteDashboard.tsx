import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext';
import { colors, spacing } from '../../theme/colors';
import SolicitarServicioModal from '../../components/SolicitarServicioModal';
import api from '../../services/api';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  status: string;
  totalCliente: number;
  gruero?: {
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
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolicitarModal, setShowSolicitarModal] = useState(false);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);

  useEffect(() => {
    getLocation();
    cargarServicioActivo();
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    console.log('📡 Configurando listeners de cliente...');

    // Servicio aceptado por gruero
    socket.on('cliente:servicioAceptado', (data: any) => {
      console.log('✅ Servicio aceptado:', data);
      Alert.alert(
        '¡Gruero en Camino! 🚚',
        `${data.gruero?.user?.nombre || 'Un gruero'} aceptó tu solicitud`,
        [{ text: 'Ver Detalles' }]
      );
      cargarServicioActivo();
    });

    // Estado actualizado por gruero
    socket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string }) => {
      console.log('📢 Estado actualizado:', data);
      
      const mensajes: Record<string, string> = {
        EN_CAMINO: '🚗 El gruero está en camino',
        EN_SITIO: '📍 El gruero llegó al lugar',
        COMPLETADO: '✅ Servicio completado',
      };

      if (mensajes[data.status]) {
        Alert.alert('Estado Actualizado', mensajes[data.status]);
      }

      cargarServicioActivo();
    });

    // Servicio cancelado
    socket.on('servicio:canceladoNotificacion', (data: any) => {
      console.log('🚫 Servicio cancelado:', data);
      
      if (data.canceladoPor === 'GRUERO') {
        Alert.alert(
          'Servicio Cancelado',
          'El gruero canceló el servicio. Puedes solicitar otro.',
          [{ text: 'OK' }]
        );
      }
      
      setServicioActivo(null);
    });

    return () => {
      socket.off('cliente:servicioAceptado');
      socket.off('cliente:estadoActualizado');
      socket.off('servicio:canceladoNotificacion');
    };
  }, [socket]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Necesitamos acceso a tu ubicación para mostrarte grueros cercanos'
        );
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
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
    } finally {
      setLoading(false);
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

  const cancelarServicio = async () => {
    if (!servicioActivo) return;

    Alert.alert(
      'Cancelar Servicio',
      '¿Estás seguro de cancelar este servicio?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
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
                
                Alert.alert('Servicio Cancelado', 'El servicio ha sido cancelado correctamente');
                setServicioActivo(null);
              }
            } catch (error: any) {
              console.error('Error cancelando servicio:', error);
              Alert.alert('Error', 'No se pudo cancelar el servicio');
            }
          },
        },
      ]
    );
  };

  const marcarComoCompletado = async () => {
    if (!servicioActivo) return;

    Alert.alert(
      'Completar Servicio',
      '¿Confirmas que el servicio fue completado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
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
                
                Alert.alert(
                  '¡Servicio Completado! 🎉',
                  `Total pagado: $${servicioActivo.totalCliente.toLocaleString('es-CL')}`
                );
                setServicioActivo(null);
              }
            } catch (error: any) {
              console.error('Error completando servicio:', error);
              Alert.alert('Error', 'No se pudo completar el servicio');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre}! 👋</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: connected ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.connectionText}>
              {connected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Servicio Activo */}
      {servicioActivo && (
        <View style={styles.servicioActivoContainer}>
          <View style={styles.servicioActivoHeader}>
            <Text style={styles.servicioActivoTitle}>
              {servicioActivo.status === 'PENDIENTE' && '⏳ Buscando Gruero...'}
              {servicioActivo.status === 'ACEPTADO' && '✅ Gruero Asignado'}
              {servicioActivo.status === 'EN_CAMINO' && '🚗 Gruero en Camino'}
              {servicioActivo.status === 'EN_SITIO' && '📍 Gruero en el Lugar'}
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
            
            {servicioActivo.status === 'PENDIENTE' && (
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={cancelarServicio}
              >
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Mapa */}
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
          {location && (
            <Marker
              coordinate={location}
              title="Tu ubicación"
              pinColor={colors.primary}
            />
          )}
        </MapView>

        {/* Botón centrar */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={getLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Botón Solicitar */}
      {!servicioActivo && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setShowSolicitarModal(true)}
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

      {/* Modal Solicitar */}
      <SolicitarServicioModal
        visible={showSolicitarModal}
        onClose={() => {
          setShowSolicitarModal(false);
          cargarServicioActivo();
        }}
        ubicacionActual={location}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  logoutButton: {
    padding: spacing.xs,
  },
  servicioActivoContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
  },
  servicioActivoHeader: {
    marginBottom: spacing.sm,
  },
  servicioActivoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  grueroInfo: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  grueroNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  grueroVehiculo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  phoneText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  servicioAcciones: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  completarButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  completarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelarButton: {
    flex: 1,
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});