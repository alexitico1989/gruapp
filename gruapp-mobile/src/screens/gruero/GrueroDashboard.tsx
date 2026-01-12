import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../contexts/SocketContext'; // ✅ IMPORTAR
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import TruckIcon from '../../components/TruckIcon';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalGruero: number;
  totalCliente: number;
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
  const { socket, connected } = useSocket(); // ✅ USAR SOCKET
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // ✅ NUEVOS ESTADOS
  const [nuevaSolicitud, setNuevaSolicitud] = useState<Servicio | null>(null);
  const [showNuevaSolicitud, setShowNuevaSolicitud] = useState(false);
  const [servicioActivo, setServicioActivo] = useState<Servicio | null>(null);

  useEffect(() => {
    getLocation();
    checkDisponibilidad();
    cargarServicioActivo();
  }, []);

  // ✅ SOCKET LISTENERS
  useEffect(() => {
    if (!socket || !disponible) return;

    console.log('📡 Configurando listeners de gruero...');

    // Nueva solicitud
    socket.on('gruero:nuevaSolicitud', (data: Servicio) => {
      console.log('🆕 Nueva solicitud recibida:', data);
      setNuevaSolicitud(data);
      setShowNuevaSolicitud(true);
    });

    // Servicio cancelado por cliente
    socket.on('servicio:canceladoNotificacion', (data: any) => {
      console.log('🚫 Servicio cancelado:', data);
      
      if (data.canceladoPor === 'CLIENTE') {
        Alert.alert(
          'Servicio Cancelado',
          'El cliente canceló el servicio',
          [{ text: 'OK' }]
        );
      }
      
      if (nuevaSolicitud && nuevaSolicitud.id === data.servicioId) {
        setShowNuevaSolicitud(false);
        setNuevaSolicitud(null);
      }
      
      setServicioActivo(null);
    });

    // Estado actualizado por cliente
    socket.on('cliente:estadoActualizado', (data: { servicioId: string; status: string }) => {
      console.log('📢 Estado actualizado por cliente:', data);
      
      if (data.status === 'COMPLETADO') {
        Alert.alert(
          '✅ Servicio Completado',
          'El cliente marcó el servicio como completado',
          [{ text: 'OK' }]
        );
        setServicioActivo(null);
      } else {
        cargarServicioActivo();
      }
    });

    return () => {
      socket.off('gruero:nuevaSolicitud');
      socket.off('servicio:canceladoNotificacion');
      socket.off('cliente:estadoActualizado');
    };
  }, [socket, disponible, nuevaSolicitud]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Necesitamos acceso a tu ubicación para que los clientes te encuentren'
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
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
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

      // 2️⃣ Emitir en tiempo real al cliente
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

        Alert.alert(
          'Estado Actualizado',
          nuevoEstado 
            ? 'Ahora estás DISPONIBLE y visible para clientes'
            : 'Ahora estás OFFLINE y no recibirás solicitudes'
        );
      }
    } catch (error: any) {
      console.error('Error cambiando disponibilidad:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar el estado'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const aceptarServicio = async () => {
    if (!nuevaSolicitud) return;

    try {
      setLoading(true);
      const response = await api.post(`/servicios/${nuevaSolicitud.id}/aceptar`);

      if (response.data.success) {
        if (socket) {
          socket.emit('servicio:aceptado', {
            servicioId: nuevaSolicitud.id,
          });
        }

        Alert.alert('¡Servicio Aceptado!', 'El cliente ha sido notificado');
        setShowNuevaSolicitud(false);
        setNuevaSolicitud(null);
        cargarServicioActivo();
      }
    } catch (error: any) {
      console.error('Error aceptando servicio:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo aceptar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const rechazarServicio = () => {
    setShowNuevaSolicitud(false);
    setNuevaSolicitud(null);
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

        const mensajes: Record<string, string> = {
          EN_CAMINO: '🚗 Estado actualizado: En Camino',
          EN_SITIO: '📍 Estado actualizado: En el Sitio',
          COMPLETADO: '✅ Servicio Completado',
        };

        Alert.alert('Estado Actualizado', mensajes[nuevoEstado] || 'Estado actualizado');
        
        if (nuevoEstado === 'COMPLETADO') {
          setServicioActivo(null);
        } else {
          cargarServicioActivo();
        }
      }
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
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
          <Text style={styles.greeting}>Hola, {user?.nombre}! 🚚</Text>
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

      {/* Estado de disponibilidad */}
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

      {/* Servicio Activo */}
      {servicioActivo && (
        <View style={styles.servicioActivoContainer}>
          <Text style={styles.servicioActivoTitle}>
            {servicioActivo.status === 'ACEPTADO' && '✅ Servicio Aceptado'}
            {servicioActivo.status === 'EN_CAMINO' && '🚗 En Camino'}
            {servicioActivo.status === 'EN_SITIO' && '📍 En el Sitio'}
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
          {location && disponible && (
            <Marker
              coordinate={location}
              title="Tu ubicación"
              description="Visible para clientes"
            >
              <View style={styles.markerContainer}>
                <TruckIcon size={28} color="#fff" />
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={getLocation}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Info Bottom */}
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

      {/* Modal Nueva Solicitud */}
      {showNuevaSolicitud && nuevaSolicitud && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={rechazarServicio}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🆕 ¡Nueva Solicitud!</Text>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.clienteInfo}>
                  <Text style={styles.clienteLabel}>Cliente</Text>
                  <Text style={styles.clienteNombreModal}>
                    {nuevaSolicitud.cliente.user.nombre} {nuevaSolicitud.cliente.user.apellido}
                  </Text>
                </View>

                <View style={styles.direccionContainer}>
                  <View style={styles.direccionItem}>
                    <Ionicons name="location" size={20} color="#10b981" />
                    <View style={styles.direccionTexto}>
                      <Text style={styles.direccionLabel}>Origen</Text>
                      <Text style={styles.direccionValor}>{nuevaSolicitud.origenDireccion}</Text>
                    </View>
                  </View>

                  <View style={styles.direccionItem}>
                    <Ionicons name="navigate" size={20} color={colors.primary} />
                    <View style={styles.direccionTexto}>
                      <Text style={styles.direccionLabel}>Destino</Text>
                      <Text style={styles.direccionValor}>{nuevaSolicitud.destinoDireccion}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Distancia</Text>
                    <Text style={styles.statBoxValue}>{nuevaSolicitud.distanciaKm} km</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: '#dcfce7' }]}>
                    <Text style={styles.statBoxLabel}>Tu Ganancia</Text>
                    <Text style={[styles.statBoxValue, { color: '#16a34a' }]}>
                      ${nuevaSolicitud.totalGruero.toLocaleString('es-CL')}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.rechazarButton]}
                  onPress={rechazarServicio}
                >
                  <Text style={styles.rechazarButtonText}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.aceptarButton]}
                  onPress={aceptarServicio}
                  disabled={loading}
                >
                  <Text style={styles.aceptarButtonText}>
                    {loading ? 'Aceptando...' : '¡Aceptar!'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ✅ AGREGAR ESTILOS ADICIONALES AL FINAL
const styles = StyleSheet.create({
  // ... (estilos existentes) ...
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  servicioActivoContainer: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  servicioActivoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  servicioInfo: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  direccion: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ganancia: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 8,
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  accionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  accionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  // ✅ ESTILOS DEL MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  modalContent: {
    padding: spacing.lg,
  },
  clienteInfo: {
    backgroundColor: '#f0f9ff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  clienteLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  clienteNombreModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  direccionContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  direccionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  direccionTexto: {
    flex: 1,
  },
  direccionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  direccionValor: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  rechazarButton: {
    backgroundColor: '#f3f4f6',
  },
  rechazarButtonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  aceptarButton: {
    backgroundColor: colors.primary,
  },
  aceptarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});