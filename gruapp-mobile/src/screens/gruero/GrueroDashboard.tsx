import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import TruckIcon from '../../components/TruckIcon'; // ✅ IMPORTAR

export default function GrueroDashboard() {
  const { user, logout } = useAuthStore();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    getLocation();
    checkDisponibilidad();
  }, []);

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

      // Enviar ubicación al backend si está disponible
      if (disponible) {
        await updateLocationOnServer(newLocation);
      }

      // Centrar mapa
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

  const updateLocationOnServer = async (loc: { latitude: number; longitude: number }) => {
    try {
      await api.put('/gruero/location', {
        latitud: loc.latitude,
        longitud: loc.longitude,
        status: 'DISPONIBLE',
      });
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

        // Si se pone disponible, enviar ubicación
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
          <Text style={styles.greeting}>Hola, {user?.nombre}!</Text>
          <Text style={styles.subtitle}>
            {disponible ? 'Estás DISPONIBLE' : 'Estás OFFLINE'}
          </Text>
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
                <TruckIcon size={32} color="#fff" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Botón centrar ubicación */}
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
        ) : (
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
        )}
      </View>
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
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: colors.primary, // ✅ Fondo naranja
    padding: -500,
    borderRadius: 550,
    borderWidth: -1,
    borderColor: '#000',
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
});