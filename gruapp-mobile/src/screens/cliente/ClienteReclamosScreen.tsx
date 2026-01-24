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
import CrearReclamoModal from '../../components/CrearReclamoModal';
import DetalleReclamoModal from '../../components/DetalleReclamoModal';

interface Reclamo {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  prioridad: string;
  createdAt: string;
  resolucion?: string;
  servicio: {
    id: string;
    origenDireccion: string;
    destinoDireccion: string;
  };
}

export default function ClienteReclamosScreen() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState<Reclamo | null>(null);

  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = async () => {
    try {
      const response = await api.get('/reclamos/mis-reclamos');
      if (response.data.success) {
        setReclamos(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando reclamos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los reclamos',
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
    cargarReclamos();
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

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      PROBLEMA_SERVICIO: 'Problema con el Servicio',
      PROBLEMA_PAGO: 'Problema de Pago',
      MALTRATO: 'Maltrato',
      OTRO: 'Otro',
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoColor = (estado: string) => {
    const colores: Record<string, { bg: string; text: string }> = {
      PENDIENTE: { bg: '#fef3c7', text: '#d97706' },
      EN_REVISION: { bg: '#dbeafe', text: '#2563eb' },
      RESUELTO: { bg: '#dcfce7', text: '#16a34a' },
      RECHAZADO: { bg: '#fee2e2', text: '#dc2626' },
    };
    return colores[estado] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  const getEstadoLabel = (estado: string) => {
    const estados: Record<string, string> = {
      PENDIENTE: '⏳ Pendiente',
      EN_REVISION: '🔍 En Revisión',
      RESUELTO: '✅ Resuelto',
      RECHAZADO: '❌ Rechazado',
    };
    return estados[estado] || estado;
  };

  const getPrioridadIcon = (prioridad: string) => {
    const prioridades: Record<string, { icon: string; color: string }> = {
      ALTA: { icon: 'alert-circle', color: '#dc2626' },
      MEDIA: { icon: 'alert', color: '#f59e0b' },
      BAJA: { icon: 'information-circle', color: '#6b7280' },
    };
    return prioridades[prioridad] || prioridades.MEDIA;
  };

  const handleVerDetalle = (reclamo: Reclamo) => {
    setReclamoSeleccionado(reclamo);
    setModalDetalleVisible(true);
  };

  const renderReclamo = ({ item }: { item: Reclamo }) => {
    const estadoColor = getEstadoColor(item.estado);
    const prioridadIcon = getPrioridadIcon(item.prioridad);

    return (
      <TouchableOpacity
        style={styles.reclamoCard}
        onPress={() => handleVerDetalle(item)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.reclamoHeader}>
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: estadoColor.bg },
            ]}
          >
            <Text style={[styles.estadoText, { color: estadoColor.text }]}>
              {getEstadoLabel(item.estado)}
            </Text>
          </View>
          <View style={styles.prioridadContainer}>
            <Ionicons
              name={prioridadIcon.icon as any}
              size={16}
              color={prioridadIcon.color}
            />
            <Text style={[styles.prioridadText, { color: prioridadIcon.color }]}>
              {item.prioridad}
            </Text>
          </View>
        </View>

        {/* Tipo */}
        <Text style={styles.tipoText}>{getTipoLabel(item.tipo)}</Text>

        {/* Descripción */}
        <Text style={styles.descripcionText} numberOfLines={2}>
          {item.descripcion}
        </Text>

        {/* Servicio */}
        <View style={styles.servicioContainer}>
          <Ionicons name="car-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.servicioText}>
            Servicio: #{item.servicio.id.substring(0, 8).toUpperCase()}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.reclamoFooter}>
          <Text style={styles.fechaText}>{formatearFecha(item.createdAt)}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando reclamos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reclamos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalCrearVisible(true)}
        >
          <Ionicons name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lista de Reclamos */}
      {reclamos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Sin Reclamos</Text>
          <Text style={styles.emptyText}>
            No has creado ningún reclamo aún
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setModalCrearVisible(true)}
          >
            <Text style={styles.emptyButtonText}>Crear Primer Reclamo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reclamos}
          renderItem={renderReclamo}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal Crear Reclamo */}
      <CrearReclamoModal
        visible={modalCrearVisible}
        onClose={() => setModalCrearVisible(false)}
        onSuccess={() => {
          setModalCrearVisible(false);
          cargarReclamos();
        }}
      />

      {/* Modal Detalle Reclamo */}
      <DetalleReclamoModal
        visible={modalDetalleVisible}
        reclamo={reclamoSeleccionado}
        onClose={() => {
          setModalDetalleVisible(false);
          setReclamoSeleccionado(null);
        }}
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
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  addButton: {
    padding: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
  },
  reclamoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reclamoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  estadoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prioridadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prioridadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  descripcionText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  servicioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  servicioText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  reclamoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaText: {
    fontSize: 12,
    color: colors.text.secondary,
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});