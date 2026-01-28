import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { colors, spacing } from '../../theme/colors';
import Toast from 'react-native-toast-message';

interface Servicio {
  id: string;
  origenDireccion: string;
  destinoDireccion: string;
  distanciaKm: number;
  totalGruero: number;
  status: string;
  solicitadoAt: string;
  completadoAt?: string;
  canceladoAt?: string;
  cliente: {
    user: {
      nombre: string;
      apellido: string;
    };
  };
  calificacion?: {
    puntuacionGruero: number;
    comentarioGruero?: string;
  };
}

export default function GrueroHistorial() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const response = await api.get('/servicios/historial');
      if (response.data.success) {
        setServicios(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo cargar el historial',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderServicio = ({ item }: { item: Servicio }) => {
    const esCompletado = item.status === 'COMPLETADO';
    const esCancelado = item.status === 'CANCELADO';

    return (
      <TouchableOpacity style={styles.servicioCard}>
        <View style={styles.servicioHeader}>
        {/* Izquierda: estado + ID */}
        <View style={{ flexShrink: 1 }}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: esCompletado
                  ? '#dcfce7'
                  : esCancelado
                  ? '#fee2e2'
                  : '#f3f4f6',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: esCompletado
                    ? '#16a34a'
                    : esCancelado
                    ? '#dc2626'
                    : '#6b7280',
                },
              ]}
            >
              {esCompletado ? '✅ Completado' : '❌ Cancelado'}
            </Text>
          </View>

          <Text style={styles.servicioId}>
            ID: {item.id}
          </Text>
        </View>

        {/* Derecha: fecha (CONTROLADA) */}
        <View style={styles.fechaContainer}>
          <Text style={styles.fecha} numberOfLines={1}>
            {formatearFecha(
              item.completadoAt || item.canceladoAt || item.solicitadoAt
            )}
          </Text>
        </View>
      </View>


        <View style={styles.clienteInfo}>
          <Ionicons name="person-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.clienteNombre}>
            {item.cliente.user.nombre} {item.cliente.user.apellido}
          </Text>
        </View>

        <View style={styles.ubicacionContainer}>
          <View style={styles.ubicacionItem}>
            <Ionicons name="location" size={16} color="#10b981" />
            <Text style={styles.ubicacionTexto} numberOfLines={1}>
              {item.origenDireccion}
            </Text>
          </View>
          <View style={styles.ubicacionItem}>
            <Ionicons name="navigate" size={16} color={colors.primary} />
            <Text style={styles.ubicacionTexto} numberOfLines={1}>
              {item.destinoDireccion}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.distanciaContainer}>
            <Ionicons name="car-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.distancia}>{item.distanciaKm.toFixed(1)} km</Text>
          </View>
          
          {esCompletado && (
            <View style={styles.gananciaContainer}>
              <Text style={styles.gananciaLabel}>Ganancia:</Text>
              <Text style={styles.ganancia}>
                ${item.totalGruero.toLocaleString('es-CL')}
              </Text>
            </View>
          )}
        </View>

        {item.calificacion && (
          <View style={styles.calificacionContainer}>
            <View style={styles.estrellas}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= item.calificacion!.puntuacionGruero ? 'star' : 'star-outline'}
                  size={16}
                  color="#fbbf24"
                />
              ))}
            </View>
            {item.calificacion.comentarioGruero && (
              <Text style={styles.comentario}>"{item.calificacion.comentarioGruero}"</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Servicios</Text>
      </View>

      {servicios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Sin historial</Text>
          <Text style={styles.emptyText}>
            Tus servicios completados aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          renderItem={renderServicio}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  listContainer: {
    padding: spacing.md,
  },
  servicioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
    servicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },


    statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fecha: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  clienteNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  ubicacionContainer: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  ubicacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ubicacionTexto: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  distanciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distancia: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  gananciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gananciaLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  ganancia: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  calificacionContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  estrellas: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: spacing.xs,
  },
  comentario: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  servicioId: {
  fontSize: 10,
  color: colors.text.secondary,
  marginTop: 4,
},

fecha: {
  fontSize: 12,
  color: colors.text.secondary,
  textAlign: 'right',
  flexShrink: 1,
},


});